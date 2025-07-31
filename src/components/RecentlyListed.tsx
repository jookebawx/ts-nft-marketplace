import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import NFTBox from "./NFTBox";
import {
    GET_ACTIVE_LISTINGS_QUERY,
    ItemListed,
    GraphQLResponse
} from "../constants";

// Async function to fetch and filter active listings
async function fetchActiveListings(): Promise<ItemListed[]> {
    const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: GET_ACTIVE_LISTINGS_QUERY,
            // No variables needed since the query is simplified
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: GraphQLResponse = await response.json();

    if (result.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    const data = result.data;
    const listedItems = data.allItemListeds.nodes;
    const boughtItems = data.allItemBoughts.nodes;
    const canceledItems = data.allItemCanceleds.nodes;

    // Create sets for quick lookup of sold or canceled NFTs
    // Use nftAddress and tokenId for matching since that's what's available
    const soldKeys = new Set(boughtItems.map(
        (item) => `${item.nftAddress}_${item.tokenId}`
    ));
    const canceledKeys = new Set(canceledItems.map(
        (item) => `${item.nftAddress}_${item.tokenId}`
    ));

    // Filter out any listed item that has a matching sold or canceled key
    const activeListings = listedItems.filter((item) => {
        const key = `${item.nftAddress}_${item.tokenId}`;
        return !soldKeys.has(key) && !canceledKeys.has(key);
    });

    return activeListings;
}

export default function RecentlyListedNFTs() {
    // Use React Query to fetch active listings
    const {
        data: activeListings,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ["activeListings"],
        queryFn: fetchActiveListings,
        refetchInterval: 30000, // Refetch every 30 seconds
        retry: 3,
    });

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Link to list an NFT */}
            <div className="mt-8 text-center">
                <Link
                    href="/list-nft"
                    className="inline-block py-2 px-4 bg-blue-600 text-white rounded-md 
                     hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2"
                >
                    List Your NFT
                </Link>
            </div>

            <h2 className="text-2xl font-bold mb-6">Recently Listed NFTs</h2>

            {/* Handle loading and error states */}
            {isLoading && (
                <div className="text-center py-8">
                    <p>Loading listings...</p>
                </div>
            )}

            {error && (
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">Failed to load listings.</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Once data is loaded, display the grid of NFT boxes */}
            {activeListings && activeListings.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
                        lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {activeListings.map((item) => (
                        <Link href={`/buy-nft/${item.nftAddress}/${item.tokenId}`} key={item.rindexerId}>
                            <NFTBox
                                key={item.rindexerId}
                                tokenId={item.tokenId}
                                contractAddress={item.nftAddress} // Using nftAddress since that's the actual NFT contract
                                price={item.price}
                            />
                        </Link>
                    ))}
                </div>
            )}

            {/* Show message when no active listings */}
            {activeListings && activeListings.length === 0 && !isLoading && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No active listings found.</p>
                </div>
            )}
        </div>
    );
}
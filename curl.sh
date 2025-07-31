curl --request POST \
  --url https://api.circle.com/v1/w3s/compliance/screening/addresses \
  --header 'Content-Type: application/json' \
  --header 'authorization: Bearer TEST_API_KEY:857fb07b8bbc2b793624cb4dc298fe22:7ab1b3e15de29ac8f223cba783c74e07'\
  --data '
{
  "idempotencyKey": "f2f4eb85-c671-4732-95ac-8f3605e1329a",
  "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "chain": "ETH-SEPOLIA"
}
'
// src/app/api/compliance/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address } = body;
        const chain = 'ETH-SEPOLIA'; // or dynamically set based on your requirements
        const circleKey = process.env.CIRCLE_API_KEY;
        if (!address) {
            return NextResponse.json({ error: 'Missing address' }, { status: 400 });
        }

        const idempotencyKey = crypto.randomUUID(); // safer and dynamic

        if (!circleKey) {
            return NextResponse.json({ error: 'Circle API key not configured' }, { status: 500 });
        }

        const complianceEnabled = process.env.ENABLE_COMPLIANCE_CHECK === 'true';
        if (!complianceEnabled) {
            return NextResponse.json({ 
                success: true,
                isApproved: true,
                data:{
                    result:"APPROVED",
                    message: 'Compliance checks are disabled'
                },
            });
        }

        const response = await fetch('https://api.circle.com/v1/w3s/compliance/screening/addresses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // optionally: include API key if Circle requires one
                'Authorization': `Bearer ${circleKey}`,
            },
            body: JSON.stringify({
                idempotencyKey,
                address,
                chain
            })
            
        });

        const data = await response.json();
        console.log(data)
        const isApproved= data?.data?.result === 'APPROVED'
        return NextResponse.json({
            success: true,
            isApproved,
            data: data?.data
        }) 
    } catch (err: any) {
        console.error("Compliance API error:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

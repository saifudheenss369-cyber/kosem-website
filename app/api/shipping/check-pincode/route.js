import { NextResponse } from 'next/server';
import { checkShiprocketServiceability } from '@/lib/shiprocket';

export async function POST(request) {
    try {
        const { pincode } = await request.json();

        if (!pincode || pincode.length !== 6) {
            return NextResponse.json({ error: 'Valid 6-digit Pincode is required' }, { status: 400 });
        }

        // Standard Attar Box (pickup: 686016, 0.2kg, checking COD availability with a 1000 dummy amount)
        const result = await checkShiprocketServiceability(686016, parseInt(pincode), 0.2, 1000);

        return NextResponse.json(result);

    } catch (error) {
        console.error("Pincode check error:", error);
        return NextResponse.json({ error: 'Failed to verify pincode' }, { status: 500 });
    }
}

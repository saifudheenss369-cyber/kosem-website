import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const { amount, mobileNumber, orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const result = await createRazorpayOrder(amount, orderId);

        if (result.success) {
            return NextResponse.json({
                id: result.id,
                amount: result.amount,
                currency: result.currency,
                keyId: result.keyId
            });
        } else {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

    } catch (error) {
        console.error('Razorpay Init Error:', error);
        return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
    }
}

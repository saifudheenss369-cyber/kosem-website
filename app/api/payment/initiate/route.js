import { NextResponse } from 'next/server';
import { createPaymentRequest } from '@/lib/instamojo';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const { amount, mobileNumber, orderId, name, email } = await req.json();

        // Ensure order ID is not undefined
        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const result = await createPaymentRequest(amount, orderId, name, email, mobileNumber);

        if (result.success) {
            // Instamojo returns a longurl to redirect to
            return NextResponse.json({
                longurl: result.url,
                paymentRequestId: result.id
            });
        } else {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

    } catch (error) {
        console.error('Instamojo Init Error:', error);
        return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
    }
}

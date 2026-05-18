import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/razorpay';
import prisma from '@/lib/prisma';
import { sendInvoiceEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
        }

        // 1. Verify Signature
        const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (isValid) {
            // 2. Update Database Order Status (including items & user info for the invoice)
            const updatedOrder = await prisma.order.update({
                where: { id: parseInt(orderId) },
                data: {
                    status: 'PAID',
                    paymentMethod: 'ONLINE'
                },
                include: {
                    user: true,
                    items: { include: { product: true } }
                }
            });

            // 3. Send Invoice Email (Awaited for Serverless Compatibility)
            try {
                await sendInvoiceEmail(updatedOrder);
            } catch (e) {
                console.error('Payment confirmation email error:', e);
            }

            return NextResponse.json({ success: true });
        } else {
            console.error('Razorpay Signature Verification Failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}

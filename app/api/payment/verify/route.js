import { NextResponse } from 'next/server';
import { getPaymentStatus } from '@/lib/instamojo';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const orderId = url.searchParams.get('orderId');
        const paymentId = url.searchParams.get('payment_id');
        const paymentStatus = url.searchParams.get('payment_status');
        const paymentRequestId = url.searchParams.get('payment_request_id');

        if (!paymentId || !orderId || !paymentRequestId) {
            return NextResponse.redirect(new URL('/checkout?error=MissingPaymentDetails', req.url));
        }

        // 1. Verify Payment via Instamojo API to prevent tampering
        const statusApi = await getPaymentStatus(paymentRequestId, paymentId);

        if (statusApi.success && (statusApi.status === 'Credit' || statusApi.status === 'Successful')) {
            // 2. Update Database Order Status
            await prisma.order.update({
                where: { id: parseInt(orderId) },
                data: {
                    status: 'PAID', // or processing
                    paymentMethod: 'ONLINE'
                }
            });

            // Redirect to success view
            return NextResponse.redirect(new URL(`/my-orders?success=true&order_id=${orderId}`, req.url));
        } else {
            console.error('Payment Verification Failed:', statusApi);
            return NextResponse.redirect(new URL('/checkout?error=PaymentFailed', req.url));
        }

    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.redirect(new URL('/checkout?error=PaymentVerificationError', req.url));
    }
}

import { NextResponse } from 'next/server';
import { verifySignature } from '@/lib/razorpay';
import prisma from '@/lib/prisma';
import { sendInvoiceEmail } from '@/lib/email';
import { sendWhatsAppAlert, buildOrderAlertMessage } from '@/lib/whatsapp';
import { sendPushNotification, buildOrderPushPayload } from '@/lib/fcm-server';

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
            // 2. Fetch the PAYMENT_PENDING order with items to decrement stock
            const pendingOrder = await prisma.order.findUnique({
                where: { id: parseInt(orderId) },
                include: {
                    user: true,
                    items: { include: { product: true } }
                }
            });

            if (!pendingOrder) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            // 3. Update order to PAID & decrement stock in a transaction
            const updatedOrder = await prisma.$transaction(async (tx) => {
                // Decrement stock for each item (deferred from order creation)
                for (const item of pendingOrder.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    });
                }

                // Mark order as PAID
                return await tx.order.update({
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
            });

            // 4. Send Invoice Email
            try {
                await sendInvoiceEmail(updatedOrder);
            } catch (e) {
                console.error('Payment confirmation email error:', e);
            }

            // 5. WhatsApp Alert
            try {
                const alertMsg = buildOrderAlertMessage(updatedOrder);
                await sendWhatsAppAlert(alertMsg);
            } catch (e) {
                console.error('WhatsApp alert error:', e);
            }

            // 6. Push Notification
            try {
                const tokenSetting = await prisma.setting.findUnique({ where: { key: 'admin_fcm_token' } });
                if (tokenSetting?.value) {
                    await sendPushNotification({ ...buildOrderPushPayload(updatedOrder), token: tokenSetting.value });
                }
            } catch (e) {
                console.error('Push Notification error:', e);
            }

            // 7. Update user profile with shipping details
            try {
                if (updatedOrder.userId && updatedOrder.userId !== 1) {
                    await prisma.user.update({
                        where: { id: updatedOrder.userId },
                        data: {
                            name: updatedOrder.shippingName,
                            address: updatedOrder.shippingAddress,
                            phone: updatedOrder.shippingPhone,
                            city: updatedOrder.shippingCity,
                            state: updatedOrder.shippingState,
                            zip: updatedOrder.shippingPincode,
                        }
                    });
                }
            } catch (e) {
                console.error('User profile sync error:', e);
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

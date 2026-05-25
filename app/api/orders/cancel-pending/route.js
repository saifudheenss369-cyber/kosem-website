
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Called when user closes Razorpay without completing payment
// Deletes the PAYMENT_PENDING order so it doesn't clutter the admin panel
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        const orderId = parseInt(id);

        // Only delete if still in PAYMENT_PENDING state (safety check)
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Only cancel if it's still pending payment — don't touch paid/shipped orders
        if (order.status !== 'PAYMENT_PENDING') {
            return NextResponse.json({ error: 'Order cannot be cancelled' }, { status: 400 });
        }

        // Delete the order items first, then the order
        await prisma.$transaction([
            prisma.orderItem.deleteMany({ where: { orderId } }),
            prisma.order.delete({ where: { id: orderId } })
        ]);

        return NextResponse.json({ success: true, message: 'Pending order cancelled' });

    } catch (error) {
        console.error('Cancel pending order error:', error);
        return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
    }
}

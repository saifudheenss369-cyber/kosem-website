import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { trackShiprocketOrder } from '@/lib/shiprocket';
import { parseSmartId } from '@/app/utils/smartId';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
        return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    try {
        const parsedId = parseSmartId(orderId);
        if (isNaN(parsedId) || !parsedId) {
            return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: parsedId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        let trackingData = null;

        if (order.shiprocketShipmentId) {
            const trackingRes = await trackShiprocketOrder(order.shiprocketShipmentId);
            if (trackingRes.success) {
                trackingData = trackingRes.trackingData;

                // Attempt to map Shiprocket status back to our DB
                let newStatus = order.status;

                // Shiprocket returns 1 for AWB Assigned, 6 for Shipped/In Transit, 7 for Delivered
                const srStatusId = trackingData.current_status_id;

                if (srStatusId === 7) {
                    newStatus = 'DELIVERED';
                } else if (srStatusId === 6 || srStatusId === 17 || srStatusId === 18) {
                    newStatus = 'SHIPPED';
                }

                if (newStatus !== order.status) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { status: newStatus }
                    });
                    order.status = newStatus; // Update local object for response
                }
            }
        }

        return NextResponse.json({ ...order, trackingData });
    } catch (error) {
        console.error("Tracking API Error:", error);
        return NextResponse.json({ error: 'Failed to track order' }, { status: 500 });
    }
}

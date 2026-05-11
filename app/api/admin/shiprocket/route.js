import { NextResponse } from 'next/server';
import {
    getShiprocketWalletBalance,
    generateShiprocketLabel,
    generateShiprocketInvoice,
    requestShiprocketPickup,
    cancelShiprocketOrder,
    assignShiprocketCourier
} from '@/lib/shiprocket';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET → Return Wallet Balance
export async function GET() {
    const res = await getShiprocketWalletBalance();
    if (res.success) {
        return NextResponse.json({ balance: res.balance });
    }
    return NextResponse.json({ error: res.error }, { status: 500 });
}

// POST → Perform an admin action
export async function POST(req) {
    const body = await req.json();
    const { action, shipmentId, orderId, shiprocketOrderId } = body;

    if (!action) {
        return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    try {
        switch (action) {
            case 'generate-label': {
                const res = await generateShiprocketLabel(shipmentId);
                if (res.success) {
                    await logAudit('SHIPROCKET_LABEL', `Generated label for shipment ${shipmentId} (Order #${orderId})`);
                }
                return NextResponse.json(res, { status: res.success ? 200 : 400 });
            }
            case 'generate-invoice': {
                const res = await generateShiprocketInvoice(orderId);
                if (res.success) {
                    await logAudit('SHIPROCKET_INVOICE', `Generated invoice for Order #${orderId}`);
                }
                return NextResponse.json(res, { status: res.success ? 200 : 400 });
            }
            case 'request-pickup': {
                const res = await requestShiprocketPickup(shipmentId);
                if (res.success) {
                    await logAudit('SHIPROCKET_PICKUP', `Scheduled pickup for shipment ${shipmentId} (Order #${orderId})`);
                }
                return NextResponse.json(res, { status: res.success ? 200 : 400 });
            }
            case 'cancel-order': {
                const res = await cancelShiprocketOrder(shiprocketOrderId);
                if (res.success) {
                    if (orderId) {
                        // Sync cancellation to our DB
                        await prisma.order.update({
                            where: { id: parseInt(orderId) },
                            data: { status: 'CANCELLED' }
                        });
                    }
                    await logAudit('SHIPROCKET_CANCEL', `Cancelled Shiprocket order ID ${shiprocketOrderId} (Order #${orderId})`);
                }
                return NextResponse.json(res, { status: res.success ? 200 : 400 });
            }
            case 'assign-courier': {
                const res = await assignShiprocketCourier(shipmentId);
                if (res.success) {
                    if (orderId && res.courierName) {
                        await prisma.order.update({
                            where: { id: parseInt(orderId) },
                            data: { courierName: res.courierName }
                        });
                    }
                    await logAudit('SHIPROCKET_COURIER', `Assigned courier ${res.courierName} for shipment ${shipmentId} (Order #${orderId})`);
                }
                return NextResponse.json(res, { status: res.success ? 200 : 400 });
            }
            case 'create-order': {
                // Fetch the full order details for Shiprocket payload
                const order = await prisma.order.findUnique({
                    where: { id: parseInt(orderId) },
                    include: { items: { include: { product: true } }, user: true }
                });

                if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

                const { createShiprocketOrder } = await import('@/lib/shiprocket');
                const res = await createShiprocketOrder(order);

                if (res.success) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: {
                            shiprocketOrderId: res.shiprocketOrderId.toString(),
                            shiprocketShipmentId: res.shipmentId ? res.shipmentId.toString() : null
                        }
                    });
                    await logAudit('SHIPROCKET_SYNC', `Manually synced Order #${orderId} to Shiprocket`);
                    return NextResponse.json({ success: true, message: 'Order synced successfully' });
                }
                return NextResponse.json({ error: res.error || 'Failed to sync' }, { status: 400 });
            }
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

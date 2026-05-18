const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
    try {
        console.log('Fetching latest 5 orders...');
        const orders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (orders.length === 0) {
            console.log('No orders found in the database.');
            return;
        }

        orders.forEach((order, index) => {
            console.log(`\n--- Order #${index + 1} ---`);
            console.log(`ID: ${order.id}`);
            console.log(`Tracking ID: ${order.trackingId}`);
            console.log(`Status: ${order.status}`);
            console.log(`Payment Method: ${order.paymentMethod}`);
            console.log(`Total: ₹${order.total}`);
            console.log(`Email: ${order.shippingEmail}`);
            console.log(`Phone: ${order.shippingPhone}`);
            console.log(`Name: ${order.shippingName}`);
            console.log(`Created At: ${order.createdAt}`);
            console.log(`Items:`, order.items.map(item => `${item.product?.name} (Qty: ${item.quantity})`));
        });
    } catch (err) {
        console.error('Error fetching orders:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkOrders();

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getLatestOrders() {
    try {
        console.log('Fetching latest 5 orders from database...');
        const orders = await prisma.order.findMany({
            take: 5,
            orderBy: { id: 'desc' },
            include: {
                user: true,
                items: true
            }
        });

        console.log('--- LATEST ORDERS ---');
        orders.forEach(order => {
            console.log(`ID: ${order.id}`);
            console.log(`Tracking ID: ${order.trackingId}`);
            console.log(`Customer: ${order.shippingName} (${order.shippingEmail})`);
            console.log(`Method: ${order.paymentMethod}`);
            console.log(`Status: ${order.status}`);
            console.log(`Total: ₹${order.total}`);
            console.log(`Created At: ${order.createdAt}`);
            console.log('---------------------');
        });

    } catch (err) {
        console.error('Error fetching orders:', err);
    } finally {
        await prisma.$disconnect();
    }
}

getLatestOrders();

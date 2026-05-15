
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearOrders() {
    try {
        console.log("Starting to clear all orders...");
        
        // 1. Delete OrderItems first (foreign key constraint)
        const deletedItems = await prisma.orderItem.deleteMany({});
        console.log(`Deleted ${deletedItems.count} order items.`);
        
        // 2. Delete Orders
        const deletedOrders = await prisma.order.deleteMany({});
        console.log(`Deleted ${deletedOrders.count} orders.`);
        
        console.log("Database cleared successfully!");
    } catch (e) {
        console.error("Error clearing orders:", e);
    } finally {
        await prisma.$disconnect();
    }
}

clearOrders();

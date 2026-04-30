
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'all'; // 'today', 'week', 'month', 'all'

    try {
        const productCount = await prisma.product.count();
        const customerCount = await prisma.user.count();

        // Determine date range filter
        let dateFilter = {};
        const now = new Date();

        if (timeframe === 'today') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = { gte: startOfDay };
        } else if (timeframe === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - 7));
            startOfWeek.setHours(0, 0, 0, 0);
            dateFilter = { gte: startOfWeek };
        } else if (timeframe === 'month') {
            const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
            startOfMonth.setHours(0, 0, 0, 0);
            dateFilter = { gte: startOfMonth };
        }

        const orderWhereClause = {
            status: { not: 'CANCELLED' },
            ...(timeframe !== 'all' ? { createdAt: dateFilter } : {})
        };

        const orderCount = await prisma.order.count({ where: orderWhereClause });

        // Fetch orders in timeframe for revenue and item analysis
        const orders = await prisma.order.findMany({
            where: orderWhereClause,
            include: { items: { include: { product: true } } }
        });

        const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

        // Calculate Sales by Category and Top Items
        const categorySales = {};
        const itemSales = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.product?.category || 'Uncategorized';
                const itemName = item.product?.name || 'Unknown Item';
                const revenue = item.price * item.quantity;

                // Category aggregate
                if (!categorySales[cat]) categorySales[cat] = 0;
                categorySales[cat] += revenue;

                // Item aggregate
                if (!itemSales[itemName]) itemSales[itemName] = { quantity: 0, revenue: 0 };
                itemSales[itemName].quantity += item.quantity;
                itemSales[itemName].revenue += revenue;
            });
        });

        // Convert key-value to sorted arrays
        const categoryData = Object.keys(categorySales)
            .map(key => ({ name: key, value: categorySales[key] }))
            .sort((a, b) => b.value - a.value); // Sort highest first

        const topItems = Object.keys(itemSales)
            .map(key => ({
                name: key,
                quantity: itemSales[key].quantity,
                revenue: itemSales[key].revenue
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5); // Get top 5 items

        return NextResponse.json({
            products: productCount,
            orders: orderCount,
            customers: customerCount,
            revenue: totalRevenue,
            categoryData,
            topItems,
            timeframe
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

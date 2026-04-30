
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const userCount = await prisma.user.count();
        const orderCount = await prisma.order.count();
        const auditCount = await prisma.auditLog.count();

        console.log(`Users: ${userCount}`);
        console.log(`Orders: ${orderCount}`);
        console.log(`AuditLogs: ${auditCount}`);

        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { email: true, role: true }
        });
        console.log('Admins:', admins);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clearAll() {
    console.log('Clearing all data...');

    const oi = await prisma.orderItem.deleteMany();
    console.log(`OrderItems deleted: ${oi.count}`);

    const rv = await prisma.review.deleteMany();
    console.log(`Reviews deleted: ${rv.count}`);

    const or = await prisma.order.deleteMany();
    console.log(`Orders deleted: ${or.count}`);

    const pr = await prisma.product.deleteMany();
    console.log(`Products deleted: ${pr.count}`);

    console.log('\nDone! DB is clean. Ready for fresh products.');
    await prisma.$disconnect();
}

clearAll().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});

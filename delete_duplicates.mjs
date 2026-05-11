import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDuplicates() {
    const allProducts = await prisma.product.findMany({
        orderBy: { id: 'asc' },
        select: { id: true, name: true }
    });

    const seen = new Map(); // name -> first id
    const toDelete = [];

    for (const p of allProducts) {
        const key = p.name.trim().toLowerCase();
        if (seen.has(key)) {
            toDelete.push(p.id);
            console.log(`Duplicate found: "${p.name}" (id: ${p.id}) — will delete`);
        } else {
            seen.set(key, p.id);
        }
    }

    if (toDelete.length === 0) {
        console.log('No duplicates found!');
    } else {
        console.log(`\nDeleting ${toDelete.length} duplicate(s)...`);
        // Delete related order items first (foreign key constraint)
        await prisma.orderItem.deleteMany({ where: { productId: { in: toDelete } } });
        await prisma.review.deleteMany({ where: { productId: { in: toDelete } } });
        const result = await prisma.product.deleteMany({ where: { id: { in: toDelete } } });
        console.log(`Done! Deleted ${result.count} duplicate product(s).`);
    }

    await prisma.$disconnect();
}

deleteDuplicates().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});

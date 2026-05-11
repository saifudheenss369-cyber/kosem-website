
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteToAdmin() {
    const email = 'faizy313786@gmail.com';

    try {
        // Try to update faizy first
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`User ${email} not found. Promoting 'admin@kosemperfume.com' instead.`);
            user = await prisma.user.update({
                where: { email: 'admin@kosemperfume.com' },
                data: { role: 'ADMIN' }
            });
        } else {
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
        }
        console.log(`Successfully promoted ${user.email} to ADMIN.`);
    } catch (e) {
        console.error('Error promoting user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

promoteToAdmin();

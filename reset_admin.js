
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function reset() {
    const email = 'admin@kosemperfumes.com';
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // 1. Check/Upsert in User table
        await prisma.user.upsert({
            where: { email },
            update: { password: hashedPassword, role: 'ADMIN' },
            create: {
                email,
                name: 'Admin',
                phone: '0000000000',
                password: hashedPassword,
                role: 'ADMIN',
                isVerified: true
            }
        });

        // 2. Check/Upsert in Admin table (The one login checks first)
        const admin = await prisma.admin.upsert({
            where: { email },
            update: { password: hashedPassword },
            create: {
                email,
                name: 'Admin User',
                password: hashedPassword,
                role: 'ADMIN'
            }
        });

        console.log(`Admin password reset for ${email} in both tables to: ${password}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

reset();

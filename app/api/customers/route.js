export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { logAudit } from '@/lib/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

async function isAdmin() {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return false;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        return decoded.role === 'ADMIN';
    } catch (err) {
        return false;
    }
}

export async function GET(req) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const customers = await prisma.user.findMany({
            // Fetch all users to allow promoting admins
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                zip: true,
                createdAt: true,
                orders: {
                    select: { total: true }
                },
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Post-process locally to calculate total spent
        const customersWithStats = customers.map(c => ({
            ...c,
            totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
            orders: undefined // clean up response
        }));

        return NextResponse.json(customersWithStats);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function PUT(req) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, role } = body;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });

        await logAudit('UPDATE_USER_ROLE', `Changed role of user ${updatedUser.email} to ${role}`);

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

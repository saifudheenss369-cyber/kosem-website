import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

async function isAdmin() {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return false;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        return decoded.role === 'ADMIN';
    } catch { return false; }
}

export async function GET(req) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Fetch real logs from DB and include Admin details safely
        const logs = await prisma.auditLog.findMany({
            include: {
                admin: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map logs to ensure they don't break the frontend if admin was deleted
        const safeLogs = logs.map(log => ({
            ...log,
            admin: log.admin || { name: 'System / Deleted User' }
        }));

        return NextResponse.json(safeLogs);
    } catch (error) {
        console.error("Audit log fetch failed:", error);
        // Return empty array instead of error to keep UI safe
        return NextResponse.json([]);
    }
}

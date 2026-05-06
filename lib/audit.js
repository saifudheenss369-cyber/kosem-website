
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function logAudit(action, details) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) return;

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'fallback_secret');

        if (decoded && decoded.role === 'ADMIN') {
            await prisma.auditLog.create({
                data: {
                    action,
                    details,
                    adminId: decoded.id || decoded.userId
                }
            });
        }
    } catch (e) {
        console.error('Audit Log Error:', e);
        // Don't crash the checking app if logging fails
    }
}

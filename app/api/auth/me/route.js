
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function GET(req) {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true, phone: true, isVerified: true, role: true, address: true, city: true, state: true, zip: true, altPhone: true, landmark: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

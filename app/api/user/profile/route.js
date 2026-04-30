
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
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { name: true, email: true, phone: true, altPhone: true, address: true, landmark: true, city: true, state: true, zip: true }
        });
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(req) {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        const { phone, altPhone, address, city, state, zip, landmark } = await req.json();

        // Check if phone is changed to reset verification
        const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
        const phoneChanged = currentUser && phone && currentUser.phone !== phone;

        const updated = await prisma.user.update({
            where: { id: decoded.userId },
            data: { 
                phone, 
                altPhone, 
                address, 
                city, 
                state, 
                zip, 
                landmark,
                isVerified: phoneChanged ? false : undefined
            }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}


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

        // If profile is empty, try to fetch from last order
        if (user && !user.address && !user.phone) {
            const lastOrder = await prisma.order.findFirst({
                where: { userId: decoded.userId },
                orderBy: { createdAt: 'desc' }
            });
            if (lastOrder) {
                user.name = user.name || lastOrder.shippingName || lastOrder.user?.name;
                user.phone = user.phone || lastOrder.shippingPhone;
                user.address = user.address || lastOrder.shippingAddress;
                user.city = user.city || lastOrder.shippingCity;
                user.state = user.state || lastOrder.shippingState;
                user.zip = user.zip || lastOrder.shippingPincode;
            }
        }

        // Filter out dummy email addresses
        if (user && user.email && user.email.includes('attarstore.local')) {
            user.email = '';
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Profile GET error:", error);
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
        const { name, email, phone, altPhone, address, city, state, zip, landmark } = await req.json();

        // Check if phone is changed to reset verification
        const currentUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
        const phoneChanged = currentUser && phone && currentUser.phone !== phone;

        const updated = await prisma.user.update({
            where: { id: decoded.userId },
            data: { 
                name,
                email,
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

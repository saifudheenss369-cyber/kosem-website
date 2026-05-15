
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const settings = await prisma.setting.findMany();
        const config = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req) {
    // Only admins can update settings
    const cookieStore = cookies();
    const token = cookieStore.get('adminToken');

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        jwt.verify(token.value, JWT_SECRET);
        const { key, value } = await req.json();

        const setting = await prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        return NextResponse.json(setting);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

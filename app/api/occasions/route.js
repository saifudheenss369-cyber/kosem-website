
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
    try {
        const occasions = await prisma.occasion.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(occasions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch occasions' }, { status: 500 });
    }
}

export async function POST(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const occasion = await prisma.occasion.create({
            data: { name }
        });

        await logAudit('CREATE_OCCASION', `Created occasion: ${name}`, 1);
        return NextResponse.json(occasion, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Occasion creation failed' }, { status: 500 });
    }
}

export async function DELETE(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.occasion.delete({
            where: { id: parseInt(id) }
        });
        await logAudit('DELETE_OCCASION', `Deleted occasion ID: ${id}`, 1);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete occasion' }, { status: 500 });
    }
}

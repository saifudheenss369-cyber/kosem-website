
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Helper to verify admin
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
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { name, image, showOnHome } = await req.json();

        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        // Generate slug
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                image: image || '',
                showOnHome: Boolean(showOnHome)
            }
        });

        await logAudit('CREATE_CATEGORY', `Created category: ${name}`, 1);

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Category creation failed' }, { status: 500 });
    }
}

export async function PUT(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id, name, image, showOnHome } = await req.json();

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const data = {};
        if (name) {
            data.name = name;
            data.slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }
        if (image !== undefined) data.image = image;
        if (showOnHome !== undefined) data.showOnHome = Boolean(showOnHome);

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data
        });

        await logAudit('UPDATE_CATEGORY', `Updated category ID: ${id}`, 1);

        return NextResponse.json(category);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Category update failed' }, { status: 500 });
    }
}

export async function DELETE(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        await logAudit('DELETE_CATEGORY', `Deleted category ID: ${id}`, 1);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}

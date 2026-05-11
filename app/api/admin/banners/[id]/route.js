import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper to check admin auth
const checkAdminAuth = () => {
    const token = cookies().get('token')?.value;
    if (!token) return false;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.role !== 'ADMIN') return false;
        return true;
    } catch (e) {
        return false;
    }
};

export async function PUT(request, { params }) {
    if (!checkAdminAuth()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;
        const body = await request.json();

        // Exclude id from the update
        const { id: _, ...updateData } = body;

        const updatedBanner = await prisma.offerBanner.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        return NextResponse.json(updatedBanner);
    } catch (error) {
        console.error('Error updating banner:', error);
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    if (!checkAdminAuth()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;

        await prisma.offerBanner.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true, message: 'Banner deleted' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
    }
}

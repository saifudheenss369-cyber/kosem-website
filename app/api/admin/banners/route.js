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

export async function GET(request) {
    try {
        const banners = await prisma.offerBanner.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
    }
}

export async function POST(request) {
    if (!checkAdminAuth()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, imageUrl, link, isActive, order } = body;

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        const newBanner = await prisma.offerBanner.create({
            data: {
                title: title || null,
                imageUrl,
                link: link || null,
                isActive: isActive !== undefined ? isActive : true,
                order: order || 0
            }
        });

        return NextResponse.json(newBanner, { status: 201 });
    } catch (error) {
        console.error('Error creating banner:', error);
        return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
    }
}

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

const getUserId = () => {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        return decoded.id; // Assuming JWT payload has id
    } catch {
        return null;
    }
};

export async function POST(req) {
    try {
        const userId = getUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Please login to leave a review.' }, { status: 401 });
        }

        const { productId, rating, text } = await req.json();

        // 1. Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: { userId, productId: parseInt(productId) }
        });
        if (existingReview) {
            return NextResponse.json({ error: 'You have already reviewed this product.' }, { status: 403 });
        }

        // 2. Check if user actually purchased this product
        const hasPurchased = await prisma.order.findFirst({
            where: {
                userId,
                items: {
                    some: { productId: parseInt(productId) }
                }
            }
        });

        if (!hasPurchased) {
            return NextResponse.json({ error: 'You can only review products you have purchased.' }, { status: 403 });
        }

        // 3. Create the review
        const review = await prisma.review.create({
            data: {
                productId: parseInt(productId),
                userId,
                rating: parseInt(rating),
                text
            },
            include: {
                user: { select: { name: true } }
            }
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Review creation error:", error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const checkEligibility = searchParams.get('checkEligibility');
    const userId = getUserId();

    try {
        if (checkEligibility === 'true') {
            if (!userId) return NextResponse.json({ canReview: false, reason: 'unauthorized' });

            const existingReview = await prisma.review.findFirst({
                where: { userId, productId: parseInt(productId) }
            });
            if (existingReview) {
                return NextResponse.json({ canReview: false, reason: 'already_reviewed' });
            }

            const hasPurchased = await prisma.order.findFirst({
                where: {
                    userId,
                    items: { some: { productId: parseInt(productId) } }
                }
            });

            if (!hasPurchased) {
                return NextResponse.json({ canReview: false, reason: 'not_purchased' });
            }

            return NextResponse.json({ canReview: true });
        }

        // Standard fetch
        const reviews = await prisma.review.findMany({
            where: { productId: parseInt(productId) },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true } }
            }
        });
        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

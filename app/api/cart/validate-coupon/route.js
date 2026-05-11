import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code || cartTotal === undefined) {
            return NextResponse.json({ error: 'Missing code or cart total' }, { status: 400 });
        }

        const upperCode = code.toUpperCase().trim();

        const coupon = await prisma.coupon.findUnique({
            where: { code: upperCode }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 });
        }

        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
            return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
        }

        if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
            return NextResponse.json({ error: `Minimum order value of ₹${coupon.minOrderValue} required` }, { status: 400 });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === 'FIXED') {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed total
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        return NextResponse.json({
            success: true,
            discountAmount: discountAmount,
            newTotal: cartTotal - discountAmount,
            message: 'Coupon applied successfully'
        });

    } catch (error) {
        console.error("Coupon validation error:", error);
        return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
    }
}

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

async function verifyAdmin() {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) return null;

    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        if (decoded.role !== 'ADMIN') return null;
        return decoded;
    } catch (e) {
        return null;
    }
}

// GET all coupons
export async function GET() {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, coupons });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

// CREATE a new coupon
export async function POST(req) {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive } = body;

        if (!code || !discountType || !discountValue) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const upperCode = code.toUpperCase().trim();

        // Check if exists
        const existing = await prisma.coupon.findUnique({
            where: { code: upperCode }
        });
        if (existing) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }

        const newCoupon = await prisma.coupon.create({
            data: {
                code: upperCode,
                discountType,
                discountValue: parseFloat(discountValue),
                minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: isActive !== undefined ? isActive : true,
            }
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                action: 'CREATE_COUPON',
                details: `Created coupon ${newCoupon.code}`,
                adminId: admin.userId
            }
        });

        return NextResponse.json({ success: true, coupon: newCoupon });
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }
}

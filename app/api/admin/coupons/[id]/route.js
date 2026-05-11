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

// UPDATE a coupon
export async function PUT(req, { params }) {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = params;
        const body = await req.json();

        // Prevent updating the code itself to avoid confusion, only update settings
        const { discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive } = body;

        const updatedCoupon = await prisma.coupon.update({
            where: { id: parseInt(id) },
            data: {
                ...(discountType && { discountType }),
                ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
                ...(minOrderValue !== undefined && { minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null }),
                ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
                ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
                ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
                ...(isActive !== undefined && { isActive }),
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'UPDATE_COUPON',
                details: `Updated coupon ${updatedCoupon.code}`,
                adminId: admin.userId
            }
        });

        return NextResponse.json({ success: true, coupon: updatedCoupon });
    } catch (error) {
        console.error("Error updating coupon:", error);
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }
}

// DELETE a coupon
export async function DELETE(req, { params }) {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = params;
        const deletedCoupon = await prisma.coupon.delete({
            where: { id: parseInt(id) }
        });

        await prisma.auditLog.create({
            data: {
                action: 'DELETE_COUPON',
                details: `Deleted coupon ${deletedCoupon.code}`,
                adminId: admin.userId
            }
        });

        return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }
}

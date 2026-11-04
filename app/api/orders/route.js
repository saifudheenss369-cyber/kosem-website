
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

import { sendInvoiceEmail, sendCancellationEmail } from '@/lib/email';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendWhatsAppAlert, buildOrderAlertMessage } from '@/lib/whatsapp';
import { sendPushNotification, buildOrderPushPayload } from '@/lib/fcm-server';
import { logAudit } from '@/lib/audit';
import { parseSmartId } from '@/app/utils/smartId';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req) {
    try {
        const { name, address, district, state, pincode, phone, email, items, total, paymentMethod, shippingMethod, couponCode, discountAmount, landmark, paymentPending } = await req.json();

        // Validate Cash on Delivery settings
        if (paymentMethod === 'COD') {
            const codSetting = await prisma.setting.findUnique({
                where: { key: 'codEnabled' }
            });
            if (codSetting && codSetting.value === 'false') {
                return NextResponse.json({ error: 'Cash on Delivery is currently disabled' }, { status: 400 });
            }
        }

        // Try to get userId from token, or find/create customer record for guest checkout
        const cookieStore = cookies();
        const token = cookieStore.get('token');
        let userId = null;

        if (token) {
            try {
                const decoded = jwt.verify(token.value, JWT_SECRET);
                if (decoded.userId) {
                    const found = await prisma.user.findUnique({ where: { id: decoded.userId } });
                    if (found) userId = found.id;
                }
            } catch (e) { /* ignore invalid token */ }
        }

        if (!userId) {
            const cleanEmail = email && email.trim() ? email.trim() : null;
            const cleanPhone = phone && phone.trim() ? phone.trim() : null;
            let guestUser = null;

            if (cleanEmail) {
                guestUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
            }
            if (!guestUser && cleanPhone) {
                guestUser = await prisma.user.findFirst({ where: { phone: cleanPhone } });
            }
            if (!guestUser) {
                guestUser = await prisma.user.create({
                    data: {
                        name: name || 'Customer',
                        email: cleanEmail || `guest_${Date.now()}@attarstore.local`,
                        password: 'OTP_LOGIN',
                        phone: cleanPhone || null,
                        address: address || null,
                        city: district || null,
                        state: state || null,
                        zip: pincode || null,
                        landmark: landmark || null,
                        role: 'CUSTOMER',
                        isVerified: false
                    }
                });
            }
            userId = guestUser.id;
        }

        // For online payments, create a PAYMENT_PENDING order WITHOUT decrementing stock
        // Stock will be decremented only after successful payment verification
        const isOnlinePending = paymentPending === true;

        // Transaction: Check Stock -> Create Order -> (Decrement Stock only if not pending)
        const order = await prisma.$transaction(async (tx) => {
            // 0. Resolve Discovery Set items (not real products): validate price from DB
            const productItems = [];
            const setItems = [];
            for (const item of items) {
                if (item.discoverySetId) {
                    const set = await tx.discoverySet.findUnique({ where: { id: parseInt(item.discoverySetId) } });
                    if (!set || !set.isActive) throw new Error('Discovery set not available');
                    let packs = [];
                    try { packs = JSON.parse(set.packs); } catch (e) { packs = []; }
                    const pack = packs.find(p => p.label === item.packLabel);
                    if (!pack) throw new Error(`Pack not found: ${item.packLabel}`);
                    const scentList = Array.isArray(item.scents) ? item.scents : [];
                    const picked = scentList.reduce((a, s) => a + (parseInt(s.qty) || 0), 0);
                    if (picked !== (parseInt(pack.count) || 0)) throw new Error(`Please select exactly ${pack.count} scents for ${set.name}`);
                    setItems.push({
                        quantity: parseInt(item.quantity),
                        price: parseFloat(pack.price),
                        title: `${set.name} - ${pack.label}`,
                        details: scentList.filter(s => s.qty > 0).map(s => `${s.name} x${s.qty}`).join(', ')
                    });
                } else {
                    productItems.push(item);
                }
            }

            // 1. Verify Stock (Batched)
            const productIds = productItems.map(item => parseInt(item.productId));
            const products = await tx.product.findMany({
                where: { id: { in: productIds } }
            });

            for (const item of productItems) {
                const product = products.find(p => p.id === parseInt(item.productId));
                if (!product) throw new Error(`Product not found: ${item.productId}`);
                if (product.stock < parseInt(item.quantity)) {
                    throw new Error(`Out of Stock: ${product.name}`);
                }
            }

            // 2. Validate & Update Coupon (If provided)
            let finalTotal = total;
            if (couponCode && !isOnlinePending) {
                const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
                if (!coupon || !coupon.isActive) {
                    throw new Error('Invalid or inactive coupon code');
                }
                if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
                    throw new Error('Coupon has expired');
                }
                if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                    throw new Error('Coupon usage limit reached');
                }

                await tx.coupon.update({
                    where: { id: coupon.id },
                    data: { usedCount: { increment: 1 } }
                });
            }

            // 3. Create Order with custom Tracking ID: KP001ODMonthDate (e.g. KP025OD0518)
            const lastOrder = await tx.order.findFirst({ orderBy: { id: 'desc' } });
            const nextSeq = lastOrder ? lastOrder.id + 1 : 1;
            const seqStr = nextSeq.toString().padStart(3, '0');
            
            const now = new Date();
            const monthStr = (now.getMonth() + 1).toString().padStart(2, '0');
            const dateStr = now.getDate().toString().padStart(2, '0');
            
            const trackingId = `KP${seqStr}OD${monthStr}${dateStr}`;
            
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total: parseFloat(finalTotal),
                    status: isOnlinePending ? 'PAYMENT_PENDING' : 'PENDING',
                    trackingId,
                    paymentMethod: paymentMethod || 'COD',
                    shippingMethod: shippingMethod || 'STANDARD',
                    couponCode: couponCode || null,
                    discountAmount: discountAmount ? parseFloat(discountAmount) : null,
                    shippingName: name,
                    shippingAddress: address,
                    shippingCity: district,
                    shippingState: state,
                    shippingPincode: pincode,
                    shippingPhone: phone,
                    shippingEmail: email,
                    items: {
                        create: [
                            ...productItems.map(item => ({
                                productId: parseInt(item.productId),
                                quantity: parseInt(item.quantity),
                                price: parseFloat(item.price)
                            })),
                            ...setItems
                        ]
                    }
                },
                include: {
                    user: true,
                    items: { include: { product: true } }
                }
            });

            // 4. Decrement Stock ONLY for COD orders (online orders decrement after payment verified)
            if (!isOnlinePending) {
                for (const item of productItems) {
                    await tx.product.update({
                        where: { id: parseInt(item.productId) },
                        data: { stock: { decrement: parseInt(item.quantity) } }
                    });
                }
            }

            return newOrder;
        });

        // --- PROCESS BACKEND ALERTS & UPDATES (skip for PAYMENT_PENDING orders) ---
        if (!isOnlinePending) {
            // 1. Update User Profile (Sync with shipping details, including email)
            try {
                if (userId && userId !== 1) {
                    const updateData = { 
                        name,
                        address, 
                        phone,
                        city: district,
                        state,
                        zip: pincode,
                        landmark
                    };

                    if (email && !email.includes('attarstore.local')) {
                        updateData.email = email;
                    }

                    await prisma.user.update({
                        where: { id: userId },
                        data: updateData
                    });
                }
            } catch (e) {
                console.error('User update background error:', e);
            }

            // 3. WhatsApp Alert
            try {
                const alertMsg = buildOrderAlertMessage(order);
                await sendWhatsAppAlert(alertMsg);
            } catch (e) {
                console.error('WhatsApp background error:', e);
            }

            // 4. Push Notification
            try {
                const tokenSetting = await prisma.setting.findUnique({ where: { key: 'admin_fcm_token' } });
                if (tokenSetting?.value) {
                    await sendPushNotification({ ...buildOrderPushPayload(order), token: tokenSetting.value });
                }
            } catch (e) {
                console.error('Push Notification background error:', e);
            }

            // 5. Invoice Email (For COD immediately; for ONLINE it will be sent after successful payment verification)
            try {
                if (order.paymentMethod === 'COD') {
                    await sendInvoiceEmail(order);
                }
            } catch (e) {
                console.error('Email background error:', e);
            }
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("ORDER CREATION EXCEPTION:", error);
        // Log more details if it's a prisma error
        if (error.code) {
           console.error("Prisma Error Code:", error.code);
           console.error("Prisma Error Meta:", error.meta);
        }
        return NextResponse.json({ 
            error: error.message || 'Order creation failed',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}

// Helper to check Admin Role
async function isAdmin() {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return false;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        return decoded.role === 'ADMIN';
    } catch (e) {
        return false;
    }
}

export async function GET(req) {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const q = searchParams.get('q'); // Search query

    // Pagination Params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (id) {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
                items: { include: { product: true } }
            }
        });
        return NextResponse.json(order);
    }

    try {
        const where = {};

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        if (q) {
            where.OR = [
                { user: { name: { contains: q, mode: 'insensitive' } } },
                { user: { phone: { contains: q } } },
                { user: { email: { contains: q, mode: 'insensitive' } } }
            ];

            // If it's a number, also try matching the exact order ID
            // or the phone number directly in order model if we added one
            const parsedId = parseSmartId(q);
            if (!isNaN(parsedId) && parsedId !== null) {
                where.OR.push({ id: parsedId });
            }
        }

        // Parallel fetch for data and count
        const [orders, total] = await prisma.$transaction([
            prisma.order.findMany({
                where,
                include: {
                    user: true,
                    items: { include: { product: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.order.count({ where })
        ]);

        return NextResponse.json({
            orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page,
                limit
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function PUT(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
        const { status } = await req.json();
        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                user: true,
                items: { include: { product: true } }
            }
        });

        if (status === 'CANCELLED') {
            try {
                await sendCancellationEmail(order);
            } catch (emailErr) {
                console.error('Failed to send cancellation email:', emailErr);
            }
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

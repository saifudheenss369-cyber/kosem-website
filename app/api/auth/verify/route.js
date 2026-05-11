
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req) {
    try {
        const { firebaseToken, phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // 1. Find existing user by phone
        let user = await prisma.user.findFirst({
            where: { phone: phone }
        });

        // 2. If no user by phone, find by email if we ever passed one, else Create New User
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: 'Guest User',
                    email: `guest_${Date.now()}@attarstore.local`,
                    password: 'OTP_LOGIN',
                    phone: phone,
                    role: 'CUSTOMER',
                    isVerified: true
                }
            });
        } else {
            // Ensure they are marked as verified
            if (!user.isVerified) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { isVerified: true, otp: null }
                });
            }
        }

        // 3. Issue new token to log them in instantly inline
        const newToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, isVerified: user.isVerified } });
        response.cookies.set('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Verification/Login failed:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}

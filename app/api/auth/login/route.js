import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/nodemailer';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req) {
    try {
        const { identifier, password, otp } = await req.json();

        // 1. First check if this user exists in the Admin table
        let existingUser = await prisma.admin.findUnique({
            where: { email: identifier }
        });

        // 2. If not found in Admin table, check the User table (email or phone)
        if (!existingUser) {
            existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { phone: identifier }
                    ]
                }
            });
        }

        if (!existingUser) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, existingUser.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (existingUser.role === 'ADMIN') {
            const adminToken = jwt.sign(
                { userId: existingUser.id, id: existingUser.id, email: existingUser.email, role: 'ADMIN' },
                JWT_SECRET,
                { expiresIn: '30d' }
            );
            const adminResponse = NextResponse.json({ message: 'Login successful', role: 'ADMIN' });
            adminResponse.cookies.set('token', adminToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            });
            return adminResponse;
        }

        // Step 1: Send Email OTP if otp not provided yet
        if (!otp) {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            await prisma.verification.upsert({
                where: { identifier: existingUser.email },
                update: {
                    otp: generatedOtp,
                    verified: false,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                },
                create: {
                    identifier: existingUser.email,
                    otp: generatedOtp,
                    verified: false,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                }
            });

            const emailResult = await sendEmail(
                existingUser.email,
                'Your Kosem Login OTP',
                `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 8px; text-align: center;">
                    <img src="https://kosemperfumes.com/logo.png" alt="Kosem Logo" style="max-width: 150px; margin-bottom: 20px;">
                    <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Login Verification Code</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                        Use the verification code below to complete your sign in. This code is valid for 10 minutes.
                    </p>
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <span style="font-size: 32px; font-weight: bold; color: #111; letter-spacing: 8px;">${generatedOtp}</span>
                    </div>
                </div>`
            );

            if (!emailResult.success) {
                return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
            }

            return NextResponse.json({
                requireOtp: true,
                email: existingUser.email,
                message: 'OTP sent to your email'
            });
        }

        // Step 2: Verify Email OTP
        const record = await prisma.verification.findUnique({
            where: { identifier: existingUser.email }
        });

        if (!record || record.otp !== otp.trim() || new Date() > record.expiresAt) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        await prisma.verification.deleteMany({ where: { identifier: existingUser.email } });

        const token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email, role: existingUser.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        const response = NextResponse.json({ message: 'Login successful', role: existingUser.role });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

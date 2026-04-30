import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/nodemailer';

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

        // Upsert Verification Record
        await prisma.verification.upsert({
            where: { identifier: email },
            update: {
                otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
            },
            create: {
                identifier: email,
                otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }
        });

        // Send Email
        const emailResult = await sendEmail(
            email,
            'Your Kosem Verification Code',
            `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 8px; text-align: center;">
                <img src="https://kosemperfume.com/logo.png" alt="Kosem Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Verify your identity</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                    To complete your request, please use the verification code below. This code is valid for the next 10 minutes.
                </p>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <span style="font-size: 32px; font-weight: bold; color: #111; letter-spacing: 8px;">${otp}</span>
                </div>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                <p style="color: #888; font-size: 14px; line-height: 1.5;">
                    If you didn't request this code, you can safely ignore this email.
                </p>
                <p style="color: #aaa; font-size: 12px; margin-top: 20px;">
                    &copy; ${new Date().getFullYear()} Kosem Perfumes. All rights reserved.
                </p>
            </div>`
        );

        if (!emailResult.success) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent to email' });

    } catch (error) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

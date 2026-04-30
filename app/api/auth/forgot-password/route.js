
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendEmail } from '@/lib/nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Return success to prevent enumeration, but log for debugging
            console.log(`[Forgot Password] Email not found: ${email}`);
            return NextResponse.json({ message: 'If that email exists, we sent a reset link.', success: true });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save to DB
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        // Send Email
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kosemperfume.com';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
        const logoUrl = `${baseUrl}/logo.png`; // Ensure you have a logo.png in public folder

        await sendEmail(
            email,
            'Reset Your Password - Kosem',
            `<div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${logoUrl}" alt="Kosem Logo" style="max-width: 150px; margin-bottom: 10px;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                </div>
                <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <p style="color: #666; font-size: 16px;">Hello ${user.name || 'User'},</p>
                    <p style="color: #666; font-size: 16px;">We received a request to reset your password for your Kosem account.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Reset Password</a>
                    </div>
                    <p style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
                    <p style="color: #999; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Kosem. All rights reserved.
                </div>
            </div>`
        );

        return NextResponse.json({ message: 'If that email exists, we sent a reset link.', success: true });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

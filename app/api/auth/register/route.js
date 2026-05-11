
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import { sendEmail } from '@/lib/nodemailer';

export async function POST(req) {
    try {
        const { name, email, password, phone } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Check Verification Status (Disabled for Firebase Frontend Trust flow)
        // const verification = await prisma.verification.findUnique({
        //     where: { identifier: email }
        // });

        // if (!verification || !verification.verified) {
        //     return NextResponse.json({ error: 'Email not verified' }, { status: 400 });
        // }

        // Check existing user
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: phone || null,
                role: 'CUSTOMER',
                isVerified: true
            },
        });

        // Cleanup verification record (if any)
        await prisma.verification.deleteMany({ where: { identifier: email } });

        // Send Welcome Email
        await sendEmail(
            email,
            'Welcome to Kosem!',
            `<div style="font-family: sans-serif; padding: 20px; text-align: center;">
                <img src="https://kosemperfume.com/logo.png" alt="Kosem Logo" style="max-width: 150px; margin-bottom: 20px;">
                <h2>Welcome, ${name}!</h2>
                <p>Thank you for creating an account with Kosem.</p>
                <p>Explore our premium collection of Attar and Oudh.</p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://kosemperfume.com'}/shop" style="display: inline-block; padding: 10px 20px; background: #d4af37; color: white; text-decoration: none; border-radius: 5px;">Shop Now</a>
            </div>`
        );

        return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}

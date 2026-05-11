import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
        }

        const record = await prisma.verification.findUnique({
            where: { identifier: email }
        });

        if (!record) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        if (record.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        if (new Date() > record.expiresAt) {
            return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
        }

        // OTP Valid - Mark as verified
        await prisma.verification.update({
            where: { identifier: email },
            data: { verified: true }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

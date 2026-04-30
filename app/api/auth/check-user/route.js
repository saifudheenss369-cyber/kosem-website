
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const { phone, email } = await req.json();

        if (!phone && !email) {
            return NextResponse.json({ error: 'Phone or Email required' }, { status: 400 });
        }

        // Check by Phone
        if (phone) {
            const userByPhone = await prisma.user.findFirst({
                where: { phone: phone }
            });
            if (userByPhone) {
                return NextResponse.json({ exists: true, field: 'phone', name: userByPhone.name });
            }
        }

        // Check by Email
        if (email) {
            const userByEmail = await prisma.user.findUnique({
                where: { email: email }
            });
            if (userByEmail) {
                return NextResponse.json({ exists: true, field: 'email', name: userByEmail.name });
            }
        }

        return NextResponse.json({ exists: false });

    } catch (error) {
        console.error('Check User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

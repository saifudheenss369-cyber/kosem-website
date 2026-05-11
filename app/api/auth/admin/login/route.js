
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        // STRICTLY check the ADMIN table
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Issue token with role 'ADMIN'
        const token = jwt.sign(
            { userId: admin.id, email: admin.email, role: 'ADMIN' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const response = NextResponse.json({ message: 'Admin Login successful', role: 'ADMIN' });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Admin Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

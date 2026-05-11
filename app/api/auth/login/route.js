
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req) {
    try {
        const { identifier, password } = await req.json();

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

        const token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email, role: existingUser.role }, // Use actual DB role
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

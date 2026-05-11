import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Save FCM token for admin push notifications
export async function POST(req) {
    try {
        const { token } = await req.json();
        if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

        // Store in DB as a Setting (upsert by key)
        await prisma.setting.upsert({
            where: { key: 'admin_fcm_token' },
            update: { value: token },
            create: { key: 'admin_fcm_token', value: token }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[FCM Token]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// Get current FCM token
export async function GET() {
    try {
        const setting = await prisma.setting.findUnique({ where: { key: 'admin_fcm_token' } });
        return NextResponse.json({ token: setting?.value || null });
    } catch (err) {
        return NextResponse.json({ token: null });
    }
}

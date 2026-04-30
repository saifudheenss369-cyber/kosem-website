import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req) {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        const { phone } = await req.json();

        // 1. Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // 2. Save to DB
        await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                otp: otp,
                phone: phone // Also update phone if provided
            }
        });

        // 3. Send OTP
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromPhone = process.env.TWILIO_PHONE;

        if (accountSid && authToken && fromPhone) {
            try {
                const client = require('twilio')(accountSid, authToken);
                await client.messages.create({
                    body: `Your Kosem Verification Code is: ${otp}`,
                    from: fromPhone,
                    to: phone
                });
                console.log(`[TWILIO] Sent OTP to ${phone}`);
                return NextResponse.json({ success: true, message: 'OTP sent successfully' }); // Don't return OTP in prod response
            } catch (twilioErr) {
                console.error('[TWILIO ERROR]', twilioErr);
                console.error('Detailed Twilio Error:', twilioErr?.message, twilioErr?.stack);
                // Fallback to mock in case of API error, or return error?
                // For now, return error so they know it failed if they expect real SMS.
                return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
            }
        } else {
            console.log(`[SMS MOCK] Sending OTP ${otp} to ${phone} for User ${decoded.userId}`);
            return NextResponse.json({ success: true, message: 'OTP sent (Mock)', otp: otp });
        }
    } catch (error) {
        console.error(error);
        console.error('Detailed OTP Error:', error?.message, error?.stack);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}

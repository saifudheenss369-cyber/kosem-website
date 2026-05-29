import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    cookies().delete('token');
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('token', '', { path: '/', maxAge: 0 });
    return response;
}

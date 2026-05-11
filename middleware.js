import { NextResponse } from 'next/server';
// import { jose } from 'jose'; // Removed unused import to fix build

// Next.js Middleware runs on Edge runtime, certain node modules like 'jsonwebtoken' might not work.
// We'll do a simple check for the token cookie existence here, and let the Layout/API handle specific validation.

export function middleware(request) {
    const token = request.cookies.get('token');

    // Protect Admin Routes
    // Exclude the login page itself to avoid redirect loops
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin', '/admin/:path*'],
};

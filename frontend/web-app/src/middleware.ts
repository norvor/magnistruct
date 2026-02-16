import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Redirect legacy /auth routes to simplified routes
    if (path === '/auth/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path === '/auth/register') {
        return NextResponse.redirect(new URL('/register', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*'],
};

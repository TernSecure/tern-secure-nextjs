import { NextResponse } from 'next/server';
const SESSION_COOKIE_NAME = '__session';
/**
 * Edge-compatible middleware for Firebase Authentication
 * Uses Firebase's session cookie (__session) to verify authentication state
 */
export function TernSecureMiddleware(request, config = {}) {
    var _a;
    const { loginPath = '/login', ignoredPaths = [
        '_next',
        'favicon.ico',
        'public',
        'login',
        'api/auth/session' // Only ignore auth session management
    ] } = config;
    // Check if path should be ignored
    const path = request.nextUrl.pathname;
    if (ignoredPaths.some(ignored => path.includes(ignored))) {
        return NextResponse.next();
    }
    // Check for Firebase session cookie
    const sessionCookie = (_a = request.cookies.get(SESSION_COOKIE_NAME)) === null || _a === void 0 ? void 0 : _a.value;
    // If no session exists, redirect to login
    if (!sessionCookie) {
        const loginUrl = new URL(loginPath, request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
}
// Config matcher for Next.js - protect all routes including API except auth endpoints
export const config = {
    matcher: [
        // Match all API routes except auth session management
        '/api/:path*',
        // Match all pages except public ones
        '/((?!_next/static|_next/image|favicon.ico|public|login).*)'
    ],
};

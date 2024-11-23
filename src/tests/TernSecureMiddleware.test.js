import { NextResponse } from 'next/server';
import { TernSecureMiddleware } from '../TernSecureMiddleware';
// Mock next/server
jest.mock('next/server', () => ({
    NextResponse: {
        next: jest.fn().mockImplementation(() => ({
            status: 200,
        })),
        redirect: jest.fn().mockImplementation((url) => ({
            status: 307,
            headers: new Headers([['location', url.toString()]]),
        })),
    },
}));
describe('TernSecureMiddleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    // Mock NextRequest
    const createMockRequest = (path, cookies = {}) => {
        const url = `https://example.com${path}`;
        return {
            nextUrl: new URL(url),
            url,
            cookies: {
                get: (name) => cookies[name] ? { value: cookies[name] } : undefined,
            },
        };
    };
    // Test cases for ignored paths
    test.each([
        '/_next/static/chunks/main.js',
        '/favicon.ico',
        '/public/image.png',
        '/login',
        '/api/auth/session'
    ])('allows access to ignored path: %s', (path) => {
        const request = createMockRequest(path);
        const response = TernSecureMiddleware(request);
        expect(NextResponse.next).toHaveBeenCalled();
    });
    // Test protected routes without session
    test.each([
        '/dashboard',
        '/api/protected',
        '/profile',
        '/settings'
    ])('redirects to login when accessing protected route without session: %s', (path) => {
        const request = createMockRequest(path);
        const response = TernSecureMiddleware(request);
        expect(NextResponse.redirect).toHaveBeenCalled();
        const redirectCall = NextResponse.redirect.mock.calls[0][0];
        expect(redirectCall.pathname).toBe('/login');
        expect(redirectCall.searchParams.get('callbackUrl')).toBe(`https://example.com${path}`);
    });
    // Test protected routes with valid session
    test.each([
        '/dashboard',
        '/api/protected',
        '/profile',
        '/settings'
    ])('allows access to protected route with valid session: %s', (path) => {
        const request = createMockRequest(path, {
            '__session': 'valid-session-token'
        });
        const response = TernSecureMiddleware(request);
        expect(NextResponse.next).toHaveBeenCalled();
    });
    // Test custom configuration
    test('respects custom login path', () => {
        const request = createMockRequest('/dashboard');
        const response = TernSecureMiddleware(request, {
            loginPath: '/custom-login'
        });
        expect(NextResponse.redirect).toHaveBeenCalled();
        const redirectCall = NextResponse.redirect.mock.calls[0][0];
        expect(redirectCall.pathname).toBe('/custom-login');
    });
    test('respects custom ignored paths', () => {
        const request = createMockRequest('/custom-public');
        const response = TernSecureMiddleware(request, {
            ignoredPaths: ['custom-public']
        });
        expect(NextResponse.next).toHaveBeenCalled();
    });
    // Test edge cases
    test('handles root path correctly', () => {
        const request = createMockRequest('/');
        const response = TernSecureMiddleware(request);
        expect(NextResponse.redirect).toHaveBeenCalled();
        const redirectCall = NextResponse.redirect.mock.calls[0][0];
        expect(redirectCall.pathname).toBe('/login');
    });
    test('handles malformed URLs gracefully', () => {
        const request = createMockRequest('///malformed/path//');
        const response = TernSecureMiddleware(request);
        expect(NextResponse.redirect).toHaveBeenCalled();
        const redirectCall = NextResponse.redirect.mock.calls[0][0];
        expect(redirectCall.pathname).toBe('/login');
    });
    // Test matcher configuration
    test('matcher configuration is correct', () => {
        const { matcher } = require('../TernSecureMiddleware').config;
        expect(matcher).toEqual([
            '/api/:path*',
            '/((?!_next/static|_next/image|favicon.ico|public|login).*)'
        ]);
    });
});

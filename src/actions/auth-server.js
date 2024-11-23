'use server';
import { cookies } from 'next/headers';
export async function setIDToken(idToken) {
    if (!idToken) {
        cookies().delete('__session');
        return;
    }
    cookies().set('__session', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour to match Firebase token expiry
        path: '/'
    });
}

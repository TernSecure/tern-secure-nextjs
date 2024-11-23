import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useSession } from '@/providers/internal/useSession';
import { TernSecureProvider } from '@/providers/TernSecureProvider';
import { getTernSecureAuth } from '@/lib/client-initializer';
import { setIDToken } from '@/actions/auth-server';
jest.mock('@/actions/auth-server', () => ({
    setIDToken: jest.fn().mockResolvedValue(undefined)
}));
jest.mock('@/lib/client-initializer');
jest.mock('@/auth');
describe('useSession hook', () => {
    const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        getIdToken: jest.fn().mockResolvedValue('mock-token')
    };
    let authCallback = null;
    beforeEach(() => {
        const mockAuth = {
            currentUser: null,
            onAuthStateChanged: jest.fn((callback) => {
                authCallback = callback;
                return () => { };
            }),
        };
        getTernSecureAuth.mockReturnValue(mockAuth);
        setIDToken.mockClear();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    // Test error case first
    test('throws error when used outside provider', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
        expect(() => {
            renderHook(() => useSession());
        }).toThrow('useSession must be used within TernSecureProvider');
        consoleError.mockRestore();
    });
    // Test normal usage within provider
    test('returns session state when used within provider', async () => {
        const { result } = renderHook(() => useSession(), {
            wrapper: ({ children }) => (<TernSecureProvider>{children}</TernSecureProvider>),
        });
        // Initial state
        expect(result.current.session).toBeNull();
        expect(result.current.loading).toBeTruthy();
        expect(result.current.error).toBeNull();
        // Simulate auth state change
        await act(async () => {
            if (authCallback) {
                authCallback(mockUser);
                await Promise.resolve();
            }
        });
        // Verify session state and token setting
        expect(result.current.session).toEqual({
            user: mockUser,
            isAuthenticated: true
        });
        expect(setIDToken).toHaveBeenCalledWith('mock-token');
    });
});

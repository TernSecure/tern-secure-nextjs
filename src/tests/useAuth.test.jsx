import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/providers/internal/useAuth';
import { TernSecureProvider } from '@/providers/TernSecureProvider';
import { TernSecureAuth } from '@/auth';
import { getTernSecureAuth } from '@/lib/client-initializer';
import { setIDToken } from '@/actions/auth-server';
jest.mock('@/auth');
jest.mock('@/lib/client-initializer');
jest.mock('@/actions/auth-server', () => ({
    setIDToken: jest.fn().mockResolvedValue(undefined)
}));
describe('useAuth hook', () => {
    const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
        getIdToken: jest.fn().mockResolvedValue('mock-token')
    };
    const mockSignIn = jest.fn().mockResolvedValue({
        user: mockUser,
        idToken: 'mock-id-token'
    });
    const mockSignUp = jest.fn().mockResolvedValue(mockUser);
    const mockLogout = jest.fn();
    const renderAuthHook = () => renderHook(() => useAuth(), {
        wrapper: ({ children }) => (<TernSecureProvider>{children}</TernSecureProvider>),
    });
    beforeEach(() => {
        TernSecureAuth.signIn.mockImplementation(mockSignIn);
        TernSecureAuth.signUp.mockImplementation(mockSignUp);
        TernSecureAuth.logout.mockImplementation(mockLogout);
        setIDToken.mockClear();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('throws error when used outside provider', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => { });
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within TernSecureProvider');
        consoleError.mockRestore();
    });
    test('handles complete authentication lifecycle', async () => {
        let authCallback = null;
        const mockAuth = {
            currentUser: null,
            onAuthStateChanged: jest.fn((callback) => {
                authCallback = callback;
                return () => { };
            }),
        };
        getTernSecureAuth.mockReturnValue(mockAuth);
        const { result } = renderAuthHook();
        // Initial state
        expect(result.current.loading).toBeTruthy();
        expect(result.current.initialized).toBeFalsy();
        expect(result.current.isAuthenticated).toBeFalsy();
        // Test signIn with token
        let signInResult;
        await act(async () => {
            signInResult = await result.current.signIn('test@example.com', 'password');
        });
        // Verify signIn result includes both user and token
        expect(signInResult).toEqual({
            user: mockUser,
            idToken: 'mock-id-token'
        });
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password');
        // Simulate auth state change to signed in
        if (authCallback) {
            await act(async () => {
                authCallback(mockUser);
            });
        }
        // Verify authenticated state
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBeTruthy();
        // Test logout
        await act(async () => {
            await result.current.logout();
        });
        expect(mockLogout).toHaveBeenCalled();
        // Simulate sign out
        if (authCallback) {
            await act(async () => {
                authCallback(null);
            });
        }
        // Verify signed out state
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBeFalsy();
        // After auth state change, verify setIDToken was called
        if (authCallback) {
            await act(async () => {
                authCallback(mockUser);
            });
        }
        // Verify setIDToken was called with the mock token
        expect(setIDToken).toHaveBeenCalledWith('mock-token');
    });
    test('handles signIn error', async () => {
        const mockError = new Error('Invalid credentials');
        mockSignIn.mockRejectedValueOnce(mockError);
        const { result } = renderAuthHook();
        try {
            await act(async () => {
                await result.current.signIn('test@example.com', 'wrong-password');
            });
        }
        catch (error) {
            expect(error).toEqual(mockError);
        }
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'wrong-password');
    });
    test('handles error state', async () => {
        let errorCallback = null;
        const mockAuth = {
            currentUser: null,
            onAuthStateChanged: jest.fn((onUser, onError) => {
                errorCallback = onError;
                return () => { };
            }),
        };
        getTernSecureAuth.mockReturnValue(mockAuth);
        const { result } = renderAuthHook();
        const mockError = new Error('Auth error');
        if (errorCallback) {
            await act(async () => {
                errorCallback(mockError);
            });
        }
        expect(result.current.error).toEqual(mockError);
        expect(result.current.loading).toBeFalsy();
        expect(result.current.initialized).toBeTruthy();
        expect(result.current.isAuthenticated).toBeFalsy();
    });
});

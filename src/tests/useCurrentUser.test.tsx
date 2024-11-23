import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useCurrentUser } from '@/providers/internal/useCurrentUser';
import { TernSecureProvider } from '@/providers/TernSecureProvider';
import { getTernSecureAuth } from '@/lib/client-initializer';
import { TernSecureUser } from '@/types';
import { TernSecureAuth } from '@/auth';
import { setIDToken } from '@/actions/auth-server';

jest.mock('@/actions/auth-server', () => ({
  setIDToken: jest.fn().mockResolvedValue(undefined)
}));
jest.mock('@/lib/client-initializer');
jest.mock('@/auth');

describe('useCurrentUser hook', () => {
  const mockUser: TernSecureUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    getIdToken: jest.fn().mockResolvedValue('mock-token')
  };

  let authCallback: ((user: TernSecureUser | null) => void) | null = null;

  const renderCurrentUserHook = () => 
    renderHook(() => useCurrentUser(), {
      wrapper: ({ children }) => (
        <TernSecureProvider>{children}</TernSecureProvider>
      ),
    });

  beforeEach(() => {
    const mockAuth = {
      currentUser: null,
      onAuthStateChanged: jest.fn((callback) => {
        authCallback = callback;
        return () => {};
      }),
    };
    (getTernSecureAuth as jest.Mock).mockReturnValue(mockAuth);
    (setIDToken as jest.Mock).mockClear();
  });

  test('updates when user signs out', async () => {
    const { result } = renderCurrentUserHook();

    // Initial state should be null
    expect(result.current).toBeNull();

    // Sign in
    await act(async () => {
      if (authCallback) {
        authCallback(mockUser);
        await Promise.resolve(); // Wait for state updates
      }
    });

    // Verify signed in state
    expect(result.current).toEqual(mockUser);
    expect(setIDToken).toHaveBeenCalledWith('mock-token');

    // Sign out
    await act(async () => {
      if (authCallback) {
        authCallback(null);
        await Promise.resolve(); // Wait for state updates
      }
    });

    // Verify signed out state
    expect(result.current).toBeNull();
  });

  test('returns null when no user is authenticated', async () => {
    const { result } = renderCurrentUserHook();
    
    await act(async () => {
      if (authCallback) {
        authCallback(null);
        await Promise.resolve();
      }
    });

    expect(result.current).toBeNull();
  });

  test('returns user when authenticated', async () => {
    const { result } = renderCurrentUserHook();

    await act(async () => {
      if (authCallback) {
        authCallback(mockUser);
        await Promise.resolve();
      }
    });

    expect(result.current).toEqual(mockUser);
    expect(setIDToken).toHaveBeenCalledWith('mock-token');
  });

  test('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useCurrentUser());
    }).toThrow('useCurrentUser must be used within TernSecureProvider');
    
    consoleError.mockRestore();
  });
});
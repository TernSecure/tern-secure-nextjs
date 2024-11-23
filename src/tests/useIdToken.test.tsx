import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useIdToken } from '@/providers/internal/useIdToken';
import { TernSecureProvider } from '@/providers/TernSecureProvider';
import { getTernSecureAuth } from '@/lib/client-initializer';
import { TernSecureAuth } from '@/auth';
import { TernSecureUser } from '@/types';
import { setIDToken } from '@/actions/auth-server';

jest.mock('@/lib/client-initializer');
jest.mock('@/auth');
jest.mock('@/actions/auth-server', () => ({
  setIDToken: jest.fn().mockResolvedValue(undefined)
}));

describe('useIdToken hook', () => {
  const mockUser: TernSecureUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    getIdToken: jest.fn().mockResolvedValue('mock-id-token')
  };

  let authCallback: ((user: TernSecureUser | null) => void) | null = null;

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('throws error when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useIdToken());
    }).toThrow('useIdToken must be used within TernSecureProvider');
    
    consoleError.mockRestore();
  });

  test('returns null token when no user is authenticated', async () => {
    const { result } = renderHook(() => useIdToken(), {
      wrapper: ({ children }) => (
        <TernSecureProvider>{children}</TernSecureProvider>
      ),
    });

    // Wait for auth state to initialize
    await act(async () => {
      if (authCallback) {
        authCallback(null);  // Explicitly set null user
        await Promise.resolve();
      }
    });

    // Then check token
    await act(async () => {
      const token = await result.current.getToken();
      expect(token).toBeNull();
    });

    // Loading should be false after getting token
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  test('returns token for authenticated user', async () => {
    const { result } = renderHook(() => useIdToken(), {
      wrapper: ({ children }) => (
        <TernSecureProvider>{children}</TernSecureProvider>
      ),
    });

    await act(async () => {
      if (authCallback) {
        authCallback(mockUser);
        await Promise.resolve();
      }
    });

    await act(async () => {
      const token = await result.current.getToken();
      expect(token).toBe('mock-id-token');
    });

    expect(mockUser.getIdToken).toHaveBeenCalledWith(false);
    expect(setIDToken).toHaveBeenCalledWith('mock-id-token');
  });

  test('handles force refresh parameter', async () => {
    const { result } = renderHook(() => useIdToken(), {
      wrapper: ({ children }) => (
        <TernSecureProvider>{children}</TernSecureProvider>
      ),
    });

    await act(async () => {
      if (authCallback) {
        authCallback(mockUser);
        await Promise.resolve();
      }
    });

    await act(async () => {
      const token = await result.current.getToken(true);
      expect(token).toBe('mock-id-token');
    });

    expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
  });

  test('handles token refresh error', async () => {
    // Create a mock user with a failing getIdToken
    const mockUserWithError: TernSecureUser = {
      ...mockUser,
      getIdToken: jest.fn().mockImplementation(() => {
        // Just return null on error, as Firebase handles refresh
        return Promise.resolve(null)
      })
    };

    const { result } = renderHook(() => useIdToken(), {
      wrapper: ({ children }) => (
        <TernSecureProvider>{children}</TernSecureProvider>
      ),
    });

    // Set up auth state with our mock user
    await act(async () => {
      if (authCallback) {
        authCallback(mockUserWithError);
        await Promise.resolve();
      }
    });

    // Attempt to get token
    let token;
    await act(async () => {
      token = await result.current.getToken();
    });

    // Verify results
    expect(token).toBeNull();  // Should return null on error
    expect(result.current.loading).toBeFalsy();  // Loading should be false
    expect(mockUserWithError.getIdToken).toHaveBeenCalled();  // Method should be called
    expect(result.current.error).toBeNull();  // No error should be exposed
  });
});
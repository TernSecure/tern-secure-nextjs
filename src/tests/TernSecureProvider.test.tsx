import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { TernSecureProvider, useAuth } from '@/providers/TernSecureProvider';
import { getTernSecureAuth } from '@/lib/client-initializer';
import { TernSecureAuth } from '@/auth';
import { setIDToken } from '@/actions/auth-server';
import '@testing-library/jest-dom';
import { TernSecureUser } from '@/types';

jest.mock('@/lib/client-initializer');
jest.mock('@/auth');
jest.mock('@/actions/auth-server', () => ({
  setIDToken: jest.fn().mockResolvedValue(undefined)
}));

describe('TernSecureProvider', () => {
  const mockUser: TernSecureUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    getIdToken: jest.fn().mockResolvedValue('mock-token')
  };

  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  };

  beforeEach(() => {
    (getTernSecureAuth as jest.Mock).mockReturnValue(mockAuth);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('provides authentication context to children and sets ID token', async () => {
    let authCallback: ((user: TernSecureUser | null) => void) | null = null;
    mockAuth.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return () => {};
    });

    const TestComponent = () => {
      const { user, loading, initialized } = useAuth();
      if (loading) return <div>Loading...</div>;
      if (!initialized) return <div>Initializing...</div>;
      return <div>{user?.email}</div>;
    };

    const { getByText } = render(
      <TernSecureProvider>
        <TestComponent />
      </TernSecureProvider>
    );

    expect(getByText('Loading...')).toBeInTheDocument();

    // Simulate auth state change
    if (authCallback) {
      await act(async () => {
        authCallback(mockUser);
      });
    }

    // Verify setIDToken was called with the mock token
    expect(setIDToken).toHaveBeenCalledWith('mock-token');
    expect(getByText('test@example.com')).toBeInTheDocument();
  });

  test('useAuth hook provides correct auth state and handles token updates', async () => {
    let authCallback: ((user: TernSecureUser | null) => void) | null = null;
    mockAuth.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <TernSecureProvider>{children}</TernSecureProvider>
      ),
    });

    // Initial state
    expect(result.current.loading).toBeTruthy();
    expect(result.current.initialized).toBeFalsy();
    expect(result.current.isAuthenticated).toBeFalsy();

    // Simulate auth state change
    if (authCallback) {
      await act(async () => {
        authCallback(mockUser);
      });
    }

    // Verify token was set
    expect(setIDToken).toHaveBeenCalledWith('mock-token');
    expect(mockUser.getIdToken).toHaveBeenCalled();

    // Verify auth state
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.initialized).toBeTruthy();
    expect(result.current.isAuthenticated).toBeTruthy();
    expect(result.current.error).toBeNull();
  });

  test('handles auth state change with no user', async () => {
    let authCallback: ((user: TernSecureUser | null) => void) | null = null;
    mockAuth.onAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <TernSecureProvider>{children}</TernSecureProvider>
      ),
    });

    if (authCallback) {
      await act(async () => {
        authCallback(null);
      });
    }

    // Verify setIDToken was not called
    expect(setIDToken).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBeFalsy();
  });
});
import { setIDToken } from '@/actions/auth-server';
import { cookies } from 'next/headers';

// Create mock functions
const mockSet = jest.fn();
const mockDelete = jest.fn();

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    set: mockSet,
    delete: mockDelete
  })
}));

describe('Auth Server Actions', () => {
  const ONE_HOUR = 60 * 60; // 1 hour in seconds

  beforeEach(() => {
    mockSet.mockClear();
    mockDelete.mockClear();
  });

  describe('setIDToken', () => {
    test('sets ID token in cookie', async () => {
      const mockToken = 'valid-id-token';
      
      await setIDToken(mockToken);

      expect(mockSet).toHaveBeenCalledWith(
        '__session',
        mockToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: ONE_HOUR,
          path: '/'
        }
      );
      expect(mockDelete).not.toHaveBeenCalled();
    });

    test('handles empty token', async () => {
      await setIDToken('');
      
      expect(mockDelete).toHaveBeenCalledWith('__session');
      expect(mockSet).not.toHaveBeenCalled();
    });

    test('handles null token', async () => {
      await setIDToken(null);
      
      expect(mockDelete).toHaveBeenCalledWith('__session');
      expect(mockSet).not.toHaveBeenCalled();
    });

    test('handles undefined token', async () => {
      await setIDToken(undefined);
      
      expect(mockDelete).toHaveBeenCalledWith('__session');
      expect(mockSet).not.toHaveBeenCalled();
    });
  });
});
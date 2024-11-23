import { getTernSecureConfig, getTernSecureAdminConfig } from '../config';

// Mock environment variables
const mockEnv = {
  TERNSECURE_FIREBASE_API_KEY: 'mock-api-key',
  TERNSECURE_FIREBASE_AUTH_DOMAIN: 'mock-domain',
  TERNSECURE_FIREBASE_PROJECT_ID: 'mock-project-id',
  TERNSECURE_FIREBASE_APP_ID: 'mock-app-id',
  // Admin credentials
  TERNSECURE_FIREBASE_CLIENT_EMAIL: 'mock-client-email',
  TERNSECURE_FIREBASE_PRIVATE_KEY: 'mock-private-key',
};

// Setup process.env mock
process.env = { ...process.env, ...mockEnv };

// Mock window to test server-side context
const windowSpy = jest.spyOn(global, 'window', 'get');

describe('Config Tests', () => {
  test('getTernSecureConfig returns client credentials', () => {
    const config = getTernSecureConfig();
    expect(config).toEqual({
      apiKey: 'mock-api-key',
      authDomain: 'mock-domain',
      projectId: 'mock-project-id',
      appId: 'mock-app-id',
    });
  });

  describe('getTernSecureAdminConfig', () => {
    let originalWindow: any;

    beforeAll(() => {
      // Store the original window value
      originalWindow = global.window;
    });

    beforeEach(() => {
      // Reset process.env to known state
      process.env = { ...mockEnv };
      // Delete window to simulate server environment
      delete (global as any).window;
    });

    afterEach(() => {
      // Restore original window after each test
      if (originalWindow) {
        (global as any).window = originalWindow;
      } else {
        delete (global as any).window;
      }
    });

    test('returns admin credentials on server side', () => {
      const adminConfig = getTernSecureAdminConfig();
      expect(adminConfig).toEqual({
        projectId: 'mock-project-id',
        clientEmail: 'mock-client-email',
        privateKey: 'mock-private-key',
      });
    });

    test('throws error when accessed on client side', () => {
      // Set window to simulate client environment
      (global as any).window = {};
      expect(() => getTernSecureAdminConfig()).toThrow(
        'Admin configuration cannot be accessed on the client side'
      );
    });

    test('throws error when credentials cannot be decrypted', () => {
      // Clear all environment variables to simulate decryption failure
      process.env = {};
      expect(() => getTernSecureAdminConfig()).toThrow(
        'Failed to decrypt credentials'
      );
    });

    test('throws error when admin config is not available', () => {
      // Set only client credentials
      process.env = {
        TERNSECURE_FIREBASE_API_KEY: 'mock-api-key',
        TERNSECURE_FIREBASE_AUTH_DOMAIN: 'mock-domain',
        TERNSECURE_FIREBASE_PROJECT_ID: 'mock-project-id',
        TERNSECURE_FIREBASE_APP_ID: 'mock-app-id',
      };
      expect(() => getTernSecureAdminConfig()).toThrow(
        'Admin configuration is not available'
      );
    });
  });
});
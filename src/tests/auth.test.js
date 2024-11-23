import { TernSecureAuth } from '../auth';
import { getTernSecureAuth } from '../lib/client-initializer';
import { getTernSecureConfig } from '../config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// Mock config similar to config.test.ts
jest.mock('../config', () => ({
    TERNSECURE_CREDENTIALS: {
        client: {
            apiKey: 'mock-api-key',
            authDomain: 'mock-domain',
            projectId: 'mock-project-id',
            storageBucket: 'mock-bucket',
            messagingSenderId: 'mock-sender-id',
            appId: 'mock-app-id',
            measurementId: 'mock-measurement-id'
        }
    },
    getTernSecureConfig: jest.fn().mockReturnValue({
        apiKey: 'mock-api-key',
        authDomain: 'mock-domain',
        projectId: 'mock-project-id',
        storageBucket: 'mock-bucket',
        messagingSenderId: 'mock-sender-id',
        appId: 'mock-app-id',
        measurementId: 'mock-measurement-id'
    })
}));
jest.mock('../lib/client-initializer');
jest.mock('firebase/auth');
describe('Auth Tests', () => {
    const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        getIdToken: jest.fn().mockResolvedValue('mock-id-token')
    };
    beforeEach(() => {
        getTernSecureAuth.mockReturnValue({});
        signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
        createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('Firebase configuration is properly loaded', () => {
        const config = getTernSecureConfig();
        expect(config).toBeDefined();
        expect(config.apiKey).toBe('mock-api-key');
        expect(config.authDomain).toBe('mock-domain');
        expect(config.projectId).toBe('mock-project-id');
    });
    test('sign in works with correct credentials and returns user with token', async () => {
        const email = 'test@example.com';
        const password = 'password123';
        const result = await TernSecureAuth.signIn(email, password);
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), email, password);
        expect(result).toEqual({
            user: mockUser,
            idToken: 'mock-id-token'
        });
        expect(mockUser.getIdToken).toHaveBeenCalled();
    });
    test('sign in handles errors correctly', async () => {
        // Create a proper Firebase Auth Error
        const mockError = new Error('Invalid password');
        mockError.code = 'auth/wrong-password';
        mockError.name = 'FirebaseError';
        signInWithEmailAndPassword.mockRejectedValue(mockError);
        try {
            await TernSecureAuth.signIn('test@example.com', 'wrong-password');
            fail('Should have thrown an error');
        }
        catch (error) {
            expect(error).toEqual({
                code: 'auth/wrong-password',
                message: 'Invalid password'
            });
        }
    });
});

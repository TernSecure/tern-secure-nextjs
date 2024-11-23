import { getTernSecureConfig, getTernSecureAdminConfig } from '../config';
// Default mock data with both client and admin
const mockDataWithAdmin = {
    client: {
        apiKey: 'test-api-key',
        authDomain: 'test-domain',
        projectId: 'test-project',
        appId: 'test-app-id'
    },
    admin: {
        projectId: 'test-admin-project',
        clientEmail: 'test@email.com',
        privateKey: 'test-private-key'
    }
};
// Mock data without admin
const mockDataWithoutAdmin = {
    client: {
        apiKey: 'test-api-key',
        authDomain: 'test-domain',
        projectId: 'test-project',
        appId: 'test-app-id'
    }
};
let mockDecryptedData = mockDataWithAdmin;
// Mock the constants module
jest.mock('../constants', () => ({
    PACKAGE_CREDENTIALS: 'mock-iv:mock-encrypted-data',
    PACKAGE_KEY: 'mock-key'
}));
// Mock crypto module
jest.mock('crypto', () => ({
    createDecipheriv: jest.fn(() => ({
        update: jest.fn(() => Buffer.from(JSON.stringify(mockDecryptedData))),
        final: jest.fn(() => Buffer.from(''))
    }))
}));
describe('Config Tests', () => {
    beforeEach(() => {
        // Reset window mock before each test
        delete global.window;
        // Reset mock data to default
        mockDecryptedData = mockDataWithAdmin;
        jest.resetModules();
    });
    test('getTernSecureConfig returns client credentials', () => {
        const config = getTernSecureConfig();
        expect(config).toEqual({
            apiKey: 'test-api-key',
            authDomain: 'test-domain',
            projectId: 'test-project',
            appId: 'test-app-id'
        });
    });
    describe('getTernSecureAdminConfig', () => {
        test('returns admin credentials', () => {
            const adminConfig = getTernSecureAdminConfig();
            expect(adminConfig).toEqual({
                projectId: 'test-admin-project',
                clientEmail: 'test@email.com',
                privateKey: 'test-private-key'
            });
        });
        test('throws error when accessed on client side', () => {
            global.window = {};
            expect(() => getTernSecureAdminConfig()).toThrow('Admin configuration cannot be accessed on the client side');
        });
        test('throws error when admin config is not available', async () => {
            // Update mock data to version without admin
            mockDecryptedData = mockDataWithoutAdmin;
            // Clear module cache to force new instance
            jest.resetModules();
            // Re-import the module to get fresh instance
            const { getTernSecureAdminConfig: freshGetAdmin } = require('../config');
            expect(() => freshGetAdmin()).toThrow('Admin configuration is not available');
        });
    });
});

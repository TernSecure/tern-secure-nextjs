// Import pre-encrypted credentials (these will be generated during build)
import { PACKAGE_CREDENTIALS, PACKAGE_KEY } from './constants';
let decryptedCredentials = null;
const decryptCredentials = () => {
    if (!decryptedCredentials) {
        try {
            const crypto = require('crypto');
            const [ivHex, encryptedDataHex] = PACKAGE_CREDENTIALS.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const encryptedData = Buffer.from(encryptedDataHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(PACKAGE_KEY), iv);
            let decrypted = decipher.update(encryptedData);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            decryptedCredentials = JSON.parse(decrypted.toString());
        }
        catch (error) {
            return null;
        }
    }
    return decryptedCredentials;
};
export const getTernSecureConfig = () => {
    const credentials = decryptCredentials();
    if (!credentials) {
        throw new Error('Failed to decrypt package credentials');
    }
    return credentials.client;
};
export const getTernSecureAdminConfig = () => {
    if (typeof window !== 'undefined') {
        throw new Error('Admin configuration cannot be accessed on the client side');
    }
    const credentials = decryptCredentials();
    if (!credentials) {
        throw new Error('Failed to decrypt package credentials');
    }
    if (!credentials.admin) {
        throw new Error('Admin configuration is not available');
    }
    return credentials.admin;
};

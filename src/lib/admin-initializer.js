//lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';
import { getTernSecureAdminConfig } from '../config';
class TernSecureAdmin {
    constructor() {
        var _a;
        const adminConfig = getTernSecureAdminConfig();
        this.app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: adminConfig.projectId,
                clientEmail: adminConfig.clientEmail,
                privateKey: (_a = adminConfig.privateKey) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
            }),
        });
        this.auth = admin.auth(this.app);
    }
    static getInstance() {
        if (typeof window !== 'undefined') {
            throw new Error('Admin SDK cannot be used on the client side');
        }
        if (!TernSecureAdmin.instance) {
            TernSecureAdmin.instance = new TernSecureAdmin();
        }
        return TernSecureAdmin.instance;
    }
    getAuth() {
        return this.auth;
    }
}
// Export singleton instance getter for auth only
export const getTernSecureAdminAuth = () => TernSecureAdmin.getInstance().getAuth();

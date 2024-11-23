//lib/firebaseAdmin.ts

import * as admin from 'firebase-admin';
import { getTernSecureAdminConfig } from '../config';

class TernSecureAdmin {
    private static instance: TernSecureAdmin;
    private app;
    private auth;

    private constructor() {
        const adminConfig = getTernSecureAdminConfig();
        this.app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: adminConfig.projectId,
                clientEmail: adminConfig.clientEmail,
                privateKey: adminConfig.privateKey?.replace(/\\n/g, '\n'),
            }),
        });
        
        this.auth = admin.auth(this.app);
    }

    static getInstance(): TernSecureAdmin {
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
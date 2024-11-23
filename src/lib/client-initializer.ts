import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getTernSecureConfig } from '../config';

class TernSecureClient {
    private static instance: TernSecureClient;
    private app;
    private auth;
    private db;

    private constructor() {
        this.app = initializeApp(getTernSecureConfig());
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
        setPersistence(this.auth, browserSessionPersistence);
    }

    static getInstance(): TernSecureClient {
        if (!TernSecureClient.instance) {
            TernSecureClient.instance = new TernSecureClient();
        }
        return TernSecureClient.instance;
    }

    getAuth() {
        return this.auth;
    }

    getDb() {
        return this.db;
    }
}

// Export singleton instance getters
export const getTernSecureAuth = () => TernSecureClient.getInstance().getAuth();
export const getTernSecureDb = () => TernSecureClient.getInstance().getDb();
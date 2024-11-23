import { encrypt } from './encryption.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });
const credentials = {
    client: {
        apiKey: process.env.TERNSECURE_FIREBASE_API_KEY,
        authDomain: process.env.TERNSECURE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.TERNSECURE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.TERNSECURE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.TERNSECURE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.TERNSECURE_FIREBASE_APP_ID,
        measurementId: process.env.TERNSECURE_FIREBASE_MEASUREMENT_ID
    },
    admin: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
    }
};
const encryptedCredentials = encrypt(credentials, process.env.PACKAGE_KEY);
const output = `PACKAGE_CREDENTIALS="${encryptedCredentials}"\n`;
// Append to .env.local
fs.appendFileSync('.env.production', output);
console.log('Encrypted credentials have been added');

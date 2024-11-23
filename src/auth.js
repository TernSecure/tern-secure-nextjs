import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getTernSecureAuth } from './lib/client-initializer';
import { validatePassword } from './lib/passwordUtils';
export class TernSecureAuth {
    static handleAuthError(error) {
        const authError = {
            code: error instanceof Error ?
                error.code || 'unknown' :
                'unknown',
            message: error instanceof Error ?
                error.message :
                'An unknown error occurred'
        };
        throw authError;
    }
    static async signIn(email, password) {
        try {
            const auth = getTernSecureAuth();
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await user.getIdToken();
            return { user, idToken };
        }
        catch (error) {
            this.handleAuthError(error);
        }
    }
    static async signUp(email, password) {
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }
        try {
            const auth = getTernSecureAuth();
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            return user;
        }
        catch (error) {
            this.handleAuthError(error);
        }
    }
    static async logout() {
        try {
            const auth = getTernSecureAuth();
            await signOut(auth);
        }
        catch (error) {
            this.handleAuthError(error);
        }
    }
}

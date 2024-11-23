import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { getTernSecureAuth } from './lib/client-initializer';
import { TernSecureError } from './types';
import { validatePassword } from './lib/passwordUtils';

export interface AuthResponse {
    user: User;
  }

export class TernSecureAuth {
  private static handleAuthError(error: unknown): never {
      const authError: TernSecureError = {
          code: error instanceof Error ? 
                (error as any).code || 'unknown' : 
                'unknown',
          message: error instanceof Error ? 
                  error.message : 
                  'An unknown error occurred'
      };
      throw authError;
  }

  static async signIn(email: string, password: string): Promise<{ user: User; idToken: string }> {
      try {
          const auth = getTernSecureAuth();
          const { user } = await signInWithEmailAndPassword(auth, email, password);
          const idToken = await user.getIdToken();
          return { user, idToken };
      } catch (error) {
          this.handleAuthError(error);
      }
  }

  static async signUp(email: string, password: string): Promise<User> {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    try {
      const auth = getTernSecureAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  static async logout(): Promise<void> {
      try {
          const auth = getTernSecureAuth();
          await signOut(auth);
      } catch (error) {
          this.handleAuthError(error);
      }
  }
}
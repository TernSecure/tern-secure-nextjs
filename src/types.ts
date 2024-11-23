// types.ts
export interface TernSecureUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    getIdToken(forceRefresh?: boolean): Promise<string>;
  }
  
export interface TernSecureError {
    code: string;
    message: string;
  }

export interface AuthState {
    user: TernSecureUser | null;
    loading: boolean;
    error: Error | null;
    initialized: boolean; 
  }
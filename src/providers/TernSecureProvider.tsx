'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthState } from '@/types'
import { TernSecureAuth } from '@/auth'
import { getTernSecureAuth } from '@/lib/client-initializer'
import { setIDToken } from '@/actions/auth-server'



interface TernSecureContextType {
  _contextKey: Symbol;
  authState: AuthState;
  auth: typeof TernSecureAuth;
}

const INTERNAL_CONTEXT_KEY = Symbol('INTERNAL_CONTEXT_KEY')
const TernSecureContext = createContext<TernSecureContextType | null>(null)

// Internal context hook
export const useInternalContext = (hookName: string) => {
  const context = useContext(TernSecureContext)
  if (!context || context._contextKey !== INTERNAL_CONTEXT_KEY) {
    throw new Error(
      `${hookName} must be used within TernSecureProvider`
    );
  }
  return context
}

export function TernSecureProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const auth = getTernSecureAuth();
    return {
      user: auth.currentUser,
      loading: false,
      error: null,
      initialized: false
    };
  });

  useEffect(() => {
    const auth = getTernSecureAuth();

    setAuthState(prev => ({ ...prev, loading: true }));
    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {
        if (user) {
          // Get new token and update session cookie
          const idToken = await user.getIdToken()
          await setIDToken(idToken)
        }

        setAuthState(prev => ({
          ...prev,
          user,
          loading: false,
          initialized: true
        }));
      },
      (error: Error) => {
        setAuthState(prev => ({
          ...prev,
          error,
          loading: false,
          initialized: true
        }));
      }
    );

    return () => unsubscribe();
  }, []);

  const contextValue: TernSecureContextType = {
    _contextKey: INTERNAL_CONTEXT_KEY,
    authState,
    auth: TernSecureAuth
  };

  return (
    <TernSecureContext.Provider value={contextValue}>
      {children}
    </TernSecureContext.Provider>
  )
}

// Export hooks
export { useAuth } from './internal/useAuth'
export { useCurrentUser } from './internal/useCurrentUser'
export { useSession } from './internal/useSession'
export { useIdToken } from './internal/useIdToken'
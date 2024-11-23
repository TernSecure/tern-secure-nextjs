import { useInternalContext } from '../TernSecureProvider'
import { TernSecureUser } from '@/types'

export interface UseAuthReturn {
  user: TernSecureUser | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ user: TernSecureUser; idToken: string }>;
  signUp: (email: string, password: string) => Promise<TernSecureUser>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  initialized: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const { authState, auth } = useInternalContext('useAuth')

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn: auth.signIn,
    signUp: auth.signUp,
    logout: auth.logout,
    isAuthenticated: !!authState.user && !authState.loading && authState.initialized,
    initialized: authState.initialized
  }
}
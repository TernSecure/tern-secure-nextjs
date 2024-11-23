import { useInternalContext } from '../TernSecureProvider'
import { TernSecureUser } from '@/types'

interface Session {
  user: TernSecureUser;
  isAuthenticated: true;
}

export interface UseSessionReturn {
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to access the current authentication session
 * Similar to Next.js Auth pattern
 * @returns UseSessionReturn - The current session state
 */
export const useSession = (): UseSessionReturn => {
  const { authState } = useInternalContext('useSession')
  
  return {
    session: authState.user ? {
      user: authState.user,
      isAuthenticated: true
    } : null,
    loading: authState.loading,
    error: authState.error
  }
}
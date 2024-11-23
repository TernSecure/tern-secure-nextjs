import { useInternalContext } from '../TernSecureProvider'
import { TernSecureUser } from '@/types'

/**
 * Hook to access the current authenticated user
 * @returns TernSecureUser | null - The current authenticated user or null if not authenticated
 */
export const useCurrentUser = (): TernSecureUser | null => {
  const { authState } = useInternalContext('useCurrentUser')
  return authState.user
}
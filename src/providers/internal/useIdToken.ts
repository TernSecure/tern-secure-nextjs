import { useInternalContext } from '../TernSecureProvider'
import { useState } from 'react'

export interface UseIdTokenReturn {
  getToken: (forceRefresh?: boolean) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to manage Firebase ID token retrieval
 * @returns UseIdTokenReturn - Token management functions and state
 */
export const useIdToken = (): UseIdTokenReturn => {
  const { authState } = useInternalContext('useIdToken')
  const [loading, setLoading] = useState(false)

  const getToken = async (forceRefresh: boolean = false): Promise<string | null> => {
    if (!authState.user) {
      return null
    }

    setLoading(true)
    try {
      return await authState.user.getIdToken(forceRefresh)
    } catch (error) {
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    getToken,
    loading: loading || authState.loading,
    error: authState.error
  }
}
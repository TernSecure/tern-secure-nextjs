import { useInternalContext } from '../TernSecureProvider';
/**
 * Hook to access the current authenticated user
 * @returns TernSecureUser | null - The current authenticated user or null if not authenticated
 */
export const useCurrentUser = () => {
    const { authState } = useInternalContext('useCurrentUser');
    return authState.user;
};

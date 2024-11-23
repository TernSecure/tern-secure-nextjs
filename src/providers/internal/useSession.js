import { useInternalContext } from '../TernSecureProvider';
/**
 * Hook to access the current authentication session
 * Similar to Next.js Auth pattern
 * @returns UseSessionReturn - The current session state
 */
export const useSession = () => {
    const { authState } = useInternalContext('useSession');
    return {
        session: authState.user ? {
            user: authState.user,
            isAuthenticated: true
        } : null,
        loading: authState.loading,
        error: authState.error
    };
};

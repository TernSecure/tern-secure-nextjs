import { useInternalContext } from '../TernSecureProvider';
export const useAuth = () => {
    const { authState, auth } = useInternalContext('useAuth');
    return {
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        signIn: auth.signIn,
        signUp: auth.signUp,
        logout: auth.logout,
        isAuthenticated: !!authState.user && !authState.loading && authState.initialized,
        initialized: authState.initialized
    };
};

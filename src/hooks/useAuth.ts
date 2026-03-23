import { useAuthContext } from '@/providers/AuthProvider';

export type { AppRole } from '@/providers/AuthProvider';

/**
 * useAuth hook that provides authentication state and methods.
 * Now a simple wrapper around AuthContext to ensure all components share the same state.
 */
export function useAuth() {
  const { 
    user, 
    session, 
    isLoading, 
    rolesLoading, 
    isAdmin, 
    isSuperAdmin, 
    signIn, 
    signUp, 
    signOut,
    updatePassword
  } = useAuthContext();

  return {
    user,
    session,
    isLoading,
    rolesLoading,
    isAdmin,
    isSuperAdmin,
    signIn,
    signUp,
    signOut,
    updatePassword,
  };
}
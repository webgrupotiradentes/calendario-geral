import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'user' | 'superadmin';

const SUPERADMIN_EMAIL = 'osvaldo@mkt.grupotiradentes.com';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  rolesLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    rolesLoading: false,
    isAdmin: false,
    isSuperAdmin: false,
  });

  const checkRoles = useCallback(async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking roles:', error);
        return { isAdmin: false, isSuperAdmin: false };
      }

      const roles = data?.map(r => r.role) || [];
      const isSuperAdmin = roles.includes('superadmin') || email === SUPERADMIN_EMAIL;
      const isAdmin = isSuperAdmin || roles.includes('admin');

      return { isAdmin, isSuperAdmin };
    } catch (error) {
      console.error('Error checking roles catch:', error);
      return { isAdmin: false, isSuperAdmin: false };
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let lastHandledUser: string | null | undefined = undefined;

    /**
     * Function to handle auth changes and fetch roles if necessary.
     * Defined inside useEffect to avoid dependency issues.
     */
    async function handleAuthChange(session: Session | null) {
      if (!mounted) return;
      
      const user = session?.user ?? null;
      console.log('Auth handle change:', user?.id, 'prev:', lastHandledUser);

      // If no user, clear state
      if (!user) {
        lastHandledUser = null;
        setState({
          user: null,
          session: null,
          isLoading: false,
          rolesLoading: false,
          isAdmin: false,
          isSuperAdmin: false,
        });
        return;
      }

      // If user is same as before, just update session/user object without re-fetching roles
      if (lastHandledUser === user.id) {
        setState(prev => ({ 
          ...prev, 
          user, 
          session, 
          isLoading: false 
        }));
        return;
      }

      // New user or initial state -> Fetch roles
      lastHandledUser = user.id;
      setState(prev => ({ 
        ...prev, 
        user, 
        session, 
        isLoading: false, 
        rolesLoading: true 
      }));

      const { isAdmin, isSuperAdmin } = await checkRoles(user.id, user.email);

      if (mounted) {
        setState({
          user,
          session,
          isLoading: false,
          rolesLoading: false,
          isAdmin,
          isSuperAdmin,
        });
      }
    }

    // Initialize session manually on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        handleAuthChange(session);
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // NOTE: event is not used here but could be used for specific logic if needed
      if (mounted) {
        handleAuthChange(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkRoles]); // checkRoles is stable from useCallback

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
  };

  const signOut = async () => {
    // Note: handleAuthChange will be called via onAuthStateChange(SIGNED_OUT)
    return await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

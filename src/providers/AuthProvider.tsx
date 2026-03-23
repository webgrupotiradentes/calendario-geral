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
     * Safety timeout: ensure isLoading is set to false eventually
     */
    const timeoutId = setTimeout(() => {
      if (mounted && state.isLoading) {
        console.warn('Auth initialization timed out, forcing isLoading: false');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }, 8000);

    async function handleAuthChange(session: Session | null) {
      if (!mounted) return;
      
      const user = session?.user ?? null;
      console.log('Auth handle change:', user?.id, 'prev:', lastHandledUser);

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

      if (lastHandledUser === user.id) {
        setState(prev => ({ 
          ...prev, 
          user, 
          session, 
          isLoading: false 
        }));
        return;
      }

      lastHandledUser = user.id;
      setState(prev => ({ ...prev, user, session, isLoading: false, rolesLoading: true }));

      const roles = await checkRoles(user.id, user.email);

      if (mounted) {
        setState({
          user,
          session,
          isLoading: false,
          rolesLoading: false,
          isAdmin: roles.isAdmin,
          isSuperAdmin: roles.isSuperAdmin,
        });
      }
    }

    // Initialize session manually on mount with error handling
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error('Session error:', error);
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
        handleAuthChange(data?.session ?? null);
      })
      .catch(err => {
        console.error('Session promise catch error:', err);
        if (mounted) setState(prev => ({ ...prev, isLoading: false }));
      });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        handleAuthChange(session);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [checkRoles]); // checkRoles is stable

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

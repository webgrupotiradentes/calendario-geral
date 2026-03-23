import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
      console.error('Error checking roles:', error);
      return { isAdmin: false, isSuperAdmin: false };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Use only onAuthStateChange as the single source for updates.
    // It fires immediately with the current session upon subscription.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, !!session?.user);

      if (!mounted) return;

      if (!session?.user) {
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

      // If we have a user, handle role fetching
      setState(prev => ({ ...prev, user: session.user, session, isLoading: false, rolesLoading: true }));

      const { isAdmin, isSuperAdmin } = await checkRoles(session.user.id, session.user.email);

      if (mounted) {
        setState({
          user: session.user,
          session,
          isLoading: false,
          rolesLoading: false,
          isAdmin,
          isSuperAdmin,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkRoles]);

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

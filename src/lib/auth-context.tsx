'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { config } from '@/lib/config';
import { getMockUser, mockSignIn, mockSignUp, mockSignOut, isMockEmailVerified } from '@/lib/mock/auth';
import { supabase } from '@/lib/supabase/client';

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  emailVerified: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshVerification: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  // Email verification is temporarily bypassed. When re-enabling, restore
  // the isMockEmailVerified() / email_confirmed_at checks below.
  useEffect(() => {
    if (config.useMockAuth) {
      const mockUser = getMockUser();
      setUser(mockUser);
      setEmailVerified(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        setEmailVerified(true);
      } else {
        setUser(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        setEmailVerified(true);
      } else {
        setUser(null);
        setEmailVerified(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshVerification = useCallback(async () => {
    // Email verification is temporarily bypassed
    setEmailVerified(true);
    return true;
  }, []);

  async function signIn(email: string, password: string) {
    if (config.useMockAuth) {
      const { error } = mockSignIn(email, password);
      if (!error) {
        setUser(getMockUser());
        setEmailVerified(isMockEmailVerified());
      }
      return { error };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  }

  async function signUp(email: string, password: string) {
    if (config.useMockAuth) {
      const { error } = mockSignUp(email, password);
      if (!error) {
        setUser(getMockUser());
        setEmailVerified(true);
      }
      return { error };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message || null };
  }

  async function signOut() {
    if (config.useMockAuth) {
      mockSignOut();
      setUser(null);
      setEmailVerified(false);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setEmailVerified(false);
  }

  return (
    <AuthContext.Provider value={{ user, loading, emailVerified, signIn, signUp, signOut, refreshVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

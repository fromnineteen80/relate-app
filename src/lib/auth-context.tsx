'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { config } from '@/lib/config';
import { getMockUser, mockSignIn, mockSignUp, mockSignOut } from '@/lib/mock/auth';
import { supabase } from '@/lib/supabase/client';

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (config.useMockAuth) {
      const mockUser = getMockUser();
      setUser(mockUser);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    if (config.useMockAuth) {
      const { error } = mockSignIn(email, password);
      if (!error) setUser(getMockUser());
      return { error };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  }

  async function signUp(email: string, password: string) {
    if (config.useMockAuth) {
      const { error } = mockSignUp(email, password);
      if (!error) setUser(getMockUser());
      return { error };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message || null };
  }

  async function signOut() {
    if (config.useMockAuth) {
      mockSignOut();
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

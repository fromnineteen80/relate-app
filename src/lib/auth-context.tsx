'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { config } from '@/lib/config';
import { getMockUser, mockSignIn, mockSignUp, mockSignOut, isMockEmailVerified } from '@/lib/mock/auth';
import { supabase } from '@/lib/supabase/client';
import { fullHydrateFromDb, subscribeToPartnerChanges } from '@/lib/supabase/progress';

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user: User | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  emailVerified: false,
  signIn: async () => ({ error: null, user: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshVerification: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const partnerSubbedRef = useRef(false);
  const partnerUnsubRef = useRef<(() => void) | null>(null);

  // Stale-while-revalidate: UI renders instantly from localStorage, then we
  // pull fresh data from Supabase in the background on every page load/refresh.
  // On a new device (empty localStorage) this is the initial hydration.
  // On the same device (refresh) this catches any changes made elsewhere.
  const syncFromDb = useCallback(async (userId: string) => {
    // Background sync: always fetch latest from Supabase
    fullHydrateFromDb(userId);

    // Set up realtime partner subscription (only once per session)
    if (!partnerSubbedRef.current) {
      partnerSubbedRef.current = true;
      if (partnerUnsubRef.current) partnerUnsubRef.current();
      partnerUnsubRef.current = subscribeToPartnerChanges(userId, () => {
        // Partner data changed; trigger a re-render
        window.dispatchEvent(new Event('relate-partner-updated'));
      });
    }
  }, []);

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
        const u = { id: session.user.id, email: session.user.email! };
        setUser(u);
        setEmailVerified(true);
        syncFromDb(u.id);
      } else {
        setUser(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = { id: session.user.id, email: session.user.email! };
        setUser(u);
        setEmailVerified(true);
        syncFromDb(u.id);
      } else {
        setUser(null);
        setEmailVerified(false);
        partnerSubbedRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, [syncFromDb]);

  const refreshVerification = useCallback(async () => {
    // Email verification is temporarily bypassed
    setEmailVerified(true);
    return true;
  }, []);

  async function signIn(email: string, password: string) {
    if (config.useMockAuth) {
      const { error } = mockSignIn(email, password);
      if (!error) {
        const mockUser = getMockUser();
        setUser(mockUser);
        setEmailVerified(isMockEmailVerified());
        return { error: null, user: mockUser };
      }
      return { error, user: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.user) {
      const signedInUser = { id: data.user.id, email: data.user.email! };
      setUser(signedInUser);
      setEmailVerified(true);
      return { error: null, user: signedInUser };
    }
    return { error: error?.message || null, user: null };
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

    // Create user server-side with auto-confirm (bypasses email verification)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Signup failed' };
    }

    // User is confirmed — sign them in immediately
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return { error: signInError.message };
    }
    return { error: null };
  }

  async function signOut() {
    // Unsubscribe from partner realtime channel
    if (partnerUnsubRef.current) {
      partnerUnsubRef.current();
      partnerUnsubRef.current = null;
    }
    partnerSubbedRef.current = false;

    // Clear all RELATE localStorage data to prevent privacy leaks on shared devices
    const relateKeys = Object.keys(localStorage).filter(k => k.startsWith('relate_'));
    relateKeys.forEach(k => localStorage.removeItem(k));
    // Clear sessionStorage (advisor messages, etc.)
    sessionStorage.clear();

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

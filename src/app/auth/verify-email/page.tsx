'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { config } from '@/lib/config';
import { mockVerifyEmail } from '@/lib/mock/auth';
import { supabase } from '@/lib/supabase/client';
import { SiteHeader } from '@/components/SiteHeader';

export default function VerifyEmailPage() {
  const { user, loading, emailVerified, refreshVerification } = useAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (emailVerified) {
      router.push('/onboarding/profile');
    }
  }, [emailVerified, router]);

  // Poll for verification every 5 seconds
  useEffect(() => {
    if (emailVerified || !user) return;
    const interval = setInterval(async () => {
      const verified = await refreshVerification();
      if (verified) {
        router.push('/onboarding/profile');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [emailVerified, user, refreshVerification, router]);

  async function handleResend() {
    setResending(true);
    if (config.useMockAuth) {
      // In mock mode, just wait briefly
      await new Promise(r => setTimeout(r, 500));
    } else {
      await supabase.auth.resend({ type: 'signup', email: user?.email || '' });
    }
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  }

  function handleMockVerify() {
    mockVerifyEmail();
    refreshVerification();
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader variant="auth" />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6 text-2xl">
            &#9993;
          </div>

          <h1 className="font-serif text-3xl font-semibold mb-2">Verify your email</h1>
          <p className="text-sm text-secondary mb-6">
            We sent a verification link to <span className="font-medium text-foreground">{user?.email}</span>. Check your inbox and click the link to continue.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={resending}
              className="btn-secondary w-full"
            >
              {resending ? 'Sending...' : resent ? 'Email sent' : 'Resend verification email'}
            </button>

            {config.useMockAuth && (
              <button
                onClick={handleMockVerify}
                className="btn-primary w-full"
              >
                Simulate Verification (Dev)
              </button>
            )}
          </div>

          <p className="text-xs text-secondary mt-6">
            Didn&apos;t receive the email? Check your spam folder, or try resending.
          </p>
        </div>
      </main>
    </div>
  );
}

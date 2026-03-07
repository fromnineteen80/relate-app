'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { useAuth } from '@/lib/auth-context';
import { Icon } from '@/components/Icon';

type InviteInfo = {
  id: string;
  inviteEmail: string;
  status: string;
  createdAt: string;
} | null;

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { user, loading: authLoading, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo>(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  // Fetch invite details on mount
  useEffect(() => {
    async function loadInvite() {
      try {
        const res = await fetch(`/api/partnerships/accept?token=${token}`);
        if (res.ok) {
          const data = await res.json();
          setInviteInfo(data);
          setEmail(data.inviteEmail || '');
        } else {
          setError('This invitation is invalid or has expired.');
        }
      } catch {
        setError('Failed to load invitation details.');
      } finally {
        setInviteLoading(false);
      }
    }
    loadInvite();
  }, [token]);

  // If user is already logged in, offer to accept directly
  async function handleAcceptAsExistingUser() {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/partnerships/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to accept invitation');
        setLoading(false);
        return;
      }
      localStorage.setItem('relate_partner_token', token);
      setAccepted(true);
    } catch {
      setError('Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  }

  // New user: sign up then accept
  async function handleSignUpAndAccept(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return;
    }

    // After signup, auth context will update with the new user.
    // Store token so we can accept after redirect.
    localStorage.setItem('relate_partner_token', token);
    localStorage.setItem('relate_pending_invite', token);
    router.push('/onboarding/profile');
  }

  // Auto-accept if user just signed up and has a pending invite
  useEffect(() => {
    if (!user || authLoading) return;
    const pendingToken = localStorage.getItem('relate_pending_invite');
    if (pendingToken) {
      localStorage.removeItem('relate_pending_invite');
      fetch('/api/partnerships/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: pendingToken, userId: user.id }),
      }).catch(() => {
        // Best-effort accept; they can retry from account page
      });
    }
  }, [user, authLoading]);

  if (inviteLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;
  }

  // Already accepted
  if (accepted) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
              <Icon name="check" size={24} />
            </div>
            <h2 className="font-serif text-2xl font-semibold mb-2">Partnership Accepted</h2>
            <p className="explainer mb-6">
              You&apos;re now connected! Complete the assessment to unlock your couples compatibility report.
            </p>
            <Link href="/assessment" className="btn-primary w-full block text-center">
              Start Assessment
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Invite already used or invalid
  if (inviteInfo?.status === 'active') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <h2 className="font-serif text-2xl font-semibold mb-2">Already Accepted</h2>
            <p className="explainer mb-6">This invitation has already been accepted.</p>
            <Link href="/auth/login" className="btn-primary w-full block text-center">Sign In</Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Logged-in user: just accept
  if (user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <h2 className="font-serif text-2xl font-semibold mb-2">You&apos;ve been invited</h2>
            <p className="explainer mb-6">
              Accept this partner invitation to connect your accounts and unlock couples features.
            </p>
            {error && <p className="text-sm text-danger mb-4">{error}</p>}
            <button onClick={handleAcceptAsExistingUser} className="btn-primary w-full" disabled={loading}>
              {loading ? 'Accepting...' : 'Accept Invitation'}
            </button>
            <p className="text-xs text-secondary mt-4 text-center">
              Signed in as {user.email}
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Not logged in: sign up form
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-2xl font-semibold mb-2">You&apos;ve been invited</h2>
          <p className="explainer mb-6">
            Create an account to take the assessment and see your couples compatibility report.
          </p>
          {error && <p className="text-sm text-danger mb-4">{error}</p>}
          <form onSubmit={handleSignUpAndAccept} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" required minLength={6} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Accept & Create Account'}
            </button>
          </form>
          <p className="text-xs text-secondary mt-4 text-center">
            Already have an account? <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link> first, then revisit this link.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { config } from '@/lib/config';

export default function InvitePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      if (config.useMockAuth) {
        // Mock: just show success
        const token = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('relate_invite_token', token);
        setSent(true);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId: user?.id }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/results" className="font-serif text-xl font-semibold tracking-tight">RELATE</Link>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto px-6 py-12 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-2">Invite Your Partner</h2>
        <p className="text-sm text-secondary mb-8">
          When your partner completes the assessment, you&apos;ll both get a couples comparison report.
        </p>

        {sent ? (
          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto mb-4 text-lg">✓</div>
            <h3 className="font-serif text-lg font-semibold mb-2">Invitation Sent</h3>
            <p className="text-sm text-secondary">
              We&apos;ve sent an invitation to <strong>{email}</strong>. They&apos;ll receive a link to complete the assessment.
            </p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="label">Partner&apos;s Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="partner@email.com"
                required
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

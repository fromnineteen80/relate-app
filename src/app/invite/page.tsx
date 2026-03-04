'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { config } from '@/lib/config';
import { SiteHeader } from '@/components/SiteHeader';

const VALID_DISCOUNT_CODE = '100-COUPLES-MARCH-2026';

export default function InvitePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPartner, setHasPartner] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState('');

  useEffect(() => {
    // Check if partner data already exists
    const partnerResults = localStorage.getItem('relate_partner_results');
    setHasPartner(!!partnerResults);
    // Check if discount was previously applied
    const savedDiscount = localStorage.getItem('relate_couples_discount');
    if (savedDiscount === VALID_DISCOUNT_CODE) setDiscountApplied(true);
  }, []);

  function handleApplyDiscount() {
    setDiscountError('');
    if (discountCode.trim() === VALID_DISCOUNT_CODE) {
      localStorage.setItem('relate_couples_discount', VALID_DISCOUNT_CODE);
      setDiscountApplied(true);
    } else {
      setDiscountError('Invalid discount code');
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      if (config.useMockAuth) {
        const token = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('relate_invite_token', token);
        localStorage.setItem('relate_partner_email', email);
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
      localStorage.setItem('relate_partner_email', email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-2">Invite Your Partner</h2>
        <p className="text-sm text-secondary mb-8">
          When your partner completes the assessment, you&apos;ll unlock the couples compatibility report, growth plan, and shared advisor.
        </p>

        {hasPartner && (
          <div className="card mb-6 border-success">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center text-sm">✓</div>
              <div>
                <p className="text-sm font-medium">Partner data available</p>
                <p className="text-xs text-secondary">You can view your couples results now.</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Link href="/couples" className="btn-primary text-xs">Couples Results</Link>
            </div>
          </div>
        )}

        {sent ? (
          <div className="card text-center">
            <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center mx-auto mb-4 text-lg">✓</div>
            <h3 className="font-serif text-lg font-semibold mb-2">Invitation Sent</h3>
            <p className="text-sm text-secondary mb-4">
              We&apos;ve sent an invitation to <strong>{email}</strong>. They&apos;ll receive a link to complete the assessment.
            </p>
            <p className="text-xs text-secondary">
              Once they complete the assessment, purchase the Couples Report ($119) to unlock your compatibility analysis.
            </p>
          </div>
        ) : (
          <>
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

            {/* Discount Code */}
            <div className="mt-6 card">
              <h3 className="font-serif text-sm font-semibold mb-2">Discount Code</h3>
              {discountApplied ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded">Discount Applied</span>
                  <span className="text-xs text-secondary">Couples dashboard unlocked</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    className="input flex-1"
                    placeholder="Enter discount code"
                  />
                  <button onClick={handleApplyDiscount} className="btn-secondary text-xs flex-shrink-0">
                    Apply
                  </button>
                </div>
              )}
              {discountError && <p className="text-xs text-danger mt-2">{discountError}</p>}
            </div>

            {/* How it works */}
            <div className="mt-8 space-y-3">
              <h3 className="font-serif text-sm font-semibold">How Couples Mode Works</h3>
              {[
                { step: '1', text: 'You invite your partner via email' },
                { step: '2', text: 'They complete the RELATE assessment independently' },
                { step: '3', text: 'Purchase the Couples Report ($119)' },
                { step: '4', text: 'Unlock compatibility analysis, growth plan, shared advisor, and more' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center flex-shrink-0 font-mono">{s.step}</span>
                  <p className="text-xs text-secondary">{s.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

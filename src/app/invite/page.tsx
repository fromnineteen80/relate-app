'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { config, type PricingTier } from '@/lib/config';
import { fetchPaymentTier, refreshPaymentTier } from '@/lib/payments';
import { SiteHeader } from '@/components/SiteHeader';
import { SubNav } from '@/components/SubNav';
import { SiteFooter } from '@/components/SiteFooter';

type PartnerInfo = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export default function InvitePage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [partnerLoading, setPartnerLoading] = useState(true);
  const [connectedAt, setConnectedAt] = useState<string | null>(null);

  // Invite flow state (when partner has no account)
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountSubmitting, setDiscountSubmitting] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');

  // Payment tier
  const [tier, setTier] = useState<PricingTier>('free');

  // Check existing partnership and tier on mount
  const loadPartnerAndTier = useCallback(async () => {
    if (!user) { setPartnerLoading(false); return; }

    try {
      // Load payment tier
      if (config.testFullAccess) {
        setTier('couples');
      } else {
        const { tier: t } = await fetchPaymentTier(user.email);
        setTier(t);
      }

      // Check for existing partnership
      if (config.useMockAuth) {
        const savedPartner = localStorage.getItem('relate_partner_email');
        const savedDiscount = localStorage.getItem('relate_couples_discount');
        if (savedPartner) {
          setPartner({ id: 'mock', email: savedPartner, firstName: null, lastName: null });
        }
        if (savedDiscount) setDiscountApplied(true);
        setPartnerLoading(false);
        return;
      }

      const res = await fetch(`/api/partner-lookup?userId=${user.id}`);
      const data = await res.json();
      if (data.partner) {
        setPartner(data.partner);
        setConnectedAt(data.connectedAt);
        localStorage.setItem('relate_partner_email', data.partner.email);
        if (data.partner.gender) localStorage.setItem('relate_partner_gender', data.partner.gender);
        if (data.partner.results) {
          localStorage.setItem('relate_partner_results', JSON.stringify(data.partner.results));
        }
      }
    } catch {
      // silent fail
    } finally {
      setPartnerLoading(false);
    }
  }, [user]);

  useEffect(() => { loadPartnerAndTier(); }, [loadPartnerAndTier]);

  // Check if discount was previously applied via payment records
  useEffect(() => {
    if (tier === 'couples') setDiscountApplied(true);
  }, [tier]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !user) return;
    setLoading(true);
    setError('');

    try {
      if (config.useMockAuth) {
        // Mock mode: just store the partner email
        localStorage.setItem('relate_partner_email', email);
        setPartner({ id: 'mock', email, firstName: 'Partner', lastName: null });
        setLoading(false);
        return;
      }

      const res = await fetch('/api/partner-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), userId: user.id, userEmail: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          // Partner not found — offer to send an invite
          setInviteEmail(email.trim());
          setShowInvite(true);
          setError('');
        } else {
          setError(data.error || 'Failed to find partner');
        }
        setLoading(false);
        return;
      }

      // Reset invite state on successful lookup
      setShowInvite(false);
      setInviteSent(false);

      setPartner(data.partner);
      setConnectedAt(data.alreadyConnected ? null : new Date().toISOString());
      localStorage.setItem('relate_partner_email', data.partner.email);

      // Fetch full partner data (including results) via GET
      try {
        const fullRes = await fetch(`/api/partner-lookup?userId=${user.id}`);
        const fullData = await fullRes.json();
        if (fullData.partner) {
          setPartner(fullData.partner);
          if (fullData.partner.gender) localStorage.setItem('relate_partner_gender', fullData.partner.gender);
          if (fullData.partner.results) {
            localStorage.setItem('relate_partner_results', JSON.stringify(fullData.partner.results));
          }
        }
      } catch { /* silent - partner details will hydrate on next page load */ }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyDiscount() {
    if (!discountCode.trim() || discountSubmitting || !user) return;
    setDiscountSubmitting(true);
    setDiscountError('');
    setDiscountMessage('');

    try {
      const res = await fetch('/api/discount-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode.trim(),
          email: user.email,
          partnerEmail: partner?.email || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDiscountApplied(true);
        setDiscountMessage(data.message);
        localStorage.setItem('relate_couples_discount', discountCode.trim());
        // Refresh payment tier
        if (data.percent === 100) {
          localStorage.removeItem('relate_payment_tier');
          const { tier: newTier } = await refreshPaymentTier(user.email);
          setTier(newTier);
        }
      } else {
        setDiscountError(data.error || 'Invalid discount code');
      }
    } catch {
      setDiscountError('Failed to apply discount code. Please try again.');
    } finally {
      setDiscountSubmitting(false);
    }
  }

  async function handleSendInvite() {
    if (!inviteEmail.trim() || inviteSending || !user) return;
    setInviteSending(true);
    setInviteError('');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), userId: user.id }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setInviteSent(true);
      } else {
        setInviteError(data.error || 'Failed to send invitation');
      }
    } catch {
      setInviteError('Something went wrong. Please try again.');
    } finally {
      setInviteSending(false);
    }
  }

  const hasCouplesAccess = tier === 'couples' || discountApplied;
  const partnerName = partner?.firstName
    ? `${partner.firstName}${partner.lastName ? ` ${partner.lastName}` : ''}`
    : partner?.email || '';
  const partnerInitial = partner?.firstName
    ? partner.firstName.charAt(0).toUpperCase()
    : partner?.email?.charAt(0).toUpperCase() || '?';

  const connectedDateStr = connectedAt
    ? new Date(connectedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  if (partnerLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
          <div className="flex items-center justify-center py-12 text-secondary">Loading...</div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <SubNav />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-2">Couples</h2>
        <p className="explainer mb-8">
          Connect with your partner to unlock your couples compatibility report, growth plan, and shared advisor.
        </p>

        {/* ── Connected Partner Display ── */}
        {partner ? (
          <div className="space-y-4">
            {/* Partner Card */}
            <div className="card border-success">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-medium flex-shrink-0">
                  {partnerInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{partnerName}</p>
                    <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded flex-shrink-0">Connected</span>
                  </div>
                  {partner.firstName && <p className="text-xs text-secondary truncate">{partner.email}</p>}
                  {connectedDateStr && (
                    <p className="text-xs text-secondary mt-0.5">Connected {connectedDateStr}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Discount Code Section ── */}
            <div className="card">
              <h3 className="font-serif text-sm font-semibold mb-3">Couples Access</h3>

              {hasCouplesAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded">Active</span>
                    <span className="text-xs text-secondary">
                      {discountMessage || 'Couples tier activated'}
                    </span>
                  </div>

                  {/* Couples Results Link */}
                  <Link
                    href="/results/compare"
                    className="btn-primary w-full text-center block"
                  >
                    View Couples Results
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Discount code input */}
                  <div>
                    <p className="text-xs text-secondary mb-2">Have a discount code?</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                        className="input flex-1 text-xs font-mono"
                        placeholder="Enter discount code"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={discountSubmitting || !discountCode.trim()}
                        className="btn-secondary text-xs flex-shrink-0"
                      >
                        {discountSubmitting ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {discountError && <p className="text-xs text-danger mt-2">{discountError}</p>}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-secondary">or</span>
                    <div className="flex-1 border-t border-border" />
                  </div>

                  {/* Pay $119 */}
                  <div>
                    <p className="text-xs text-secondary mb-2">
                      Unlock Couples Mode for both you and your partner.
                    </p>
                    <a
                      href={`/api/checkout?product=couples&email=${encodeURIComponent(user?.email || '')}`}
                      className="btn-primary w-full text-center block"
                    >
                      Get Couples Report, $119
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* What's included */}
            {!hasCouplesAccess && (
              <div className="card">
                <h3 className="font-serif text-sm font-semibold mb-3">What&apos;s Included</h3>
                <ul className="space-y-2">
                  {[
                    'Full compatibility report across 7 dimensions',
                    'Conflict choreography and repair analysis',
                    'Relationship ceiling/floor potential',
                    'Daily life compatibility patterns',
                    'Shared AI relationship advisor',
                    'Growth challenges and weekly check-ins',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-success text-xs mt-0.5 flex-shrink-0">+</span>
                      <span className="text-xs text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* ── Email Lookup Form ── */
          <div className="space-y-6">
            <form onSubmit={handleLookup} className="card">
              <h3 className="font-serif text-sm font-semibold mb-3">Find Your Partner</h3>
              <p className="text-xs text-secondary mb-4">
                Enter your partner&apos;s email address to connect your accounts.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setShowInvite(false); setInviteSent(false); }}
                  className="input"
                  placeholder="partner@email.com"
                  required
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Looking up...' : 'Connect Partner'}
                </button>
              </div>
            </form>

            {/* ── Invite Flow (partner not found) ── */}
            {showInvite && !inviteSent && (
              <div className="card">
                <h3 className="font-serif text-sm font-semibold mb-2">No Account Found</h3>
                <p className="text-xs text-secondary mb-4">
                  <span className="font-medium text-primary">{inviteEmail}</span> doesn&apos;t have a RELATE account yet.
                  Send them an invitation to sign up and take the assessment.
                </p>
                {inviteError && <p className="text-xs text-danger mb-3">{inviteError}</p>}
                <button
                  onClick={handleSendInvite}
                  disabled={inviteSending}
                  className="btn-primary w-full"
                >
                  {inviteSending ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            )}

            {/* ── Invite Sent Confirmation ── */}
            {inviteSent && (
              <div className="card border-success">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-success/10 text-success text-xs flex items-center justify-center flex-shrink-0 mt-0.5">&#10003;</span>
                  <div>
                    <h3 className="font-serif text-sm font-semibold mb-1">Invitation Sent</h3>
                    <p className="text-xs text-secondary">
                      We sent an invitation to <span className="font-medium text-primary">{inviteEmail}</span>.
                      Once they create an account and complete the assessment, come back here to connect.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm font-semibold">How It Works</h3>
              {[
                { step: '1', text: 'Enter your partner\'s email to connect your accounts' },
                { step: '2', text: 'If they don\'t have an account, send them an invitation' },
                { step: '3', text: 'Both partners complete the RELATE assessment' },
                { step: '4', text: 'Use a discount code or pay $119 for Couples access' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center flex-shrink-0 font-mono">{s.step}</span>
                  <p className="text-xs text-secondary">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

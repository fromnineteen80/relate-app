'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { PRICING, BLUEPRINT_PRICING, type PricingTier, config } from '@/lib/config';
import { fetchPaymentTier, fetchBlueprintAccess } from '@/lib/payments';
import { SiteHeader } from '@/components/SiteHeader';
import { SubNav } from '@/components/SubNav';
import { SiteFooter } from '@/components/SiteFooter';
import { Icon } from '@/components/Icon';

/* eslint-disable @typescript-eslint/no-explicit-any */

type SubscriptionInfo = {
  id: string;
  status: string;
  product: string;
  currentPeriodEnd: string;
  currentPeriodStart: string;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  createdAt: string;
  paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null;
  discount: { name: string; percentOff: number | null; amountOff: number | null; end: string | null } | null;
};

const TIER_ORDER: PricingTier[] = ['free', 'plus', 'premium', 'pro', 'couples'];

function tierIndex(t: PricingTier) {
  return TIER_ORDER.indexOf(t);
}

type PartnerInfo = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export default function BillingPage() {
  const { user } = useAuth();
  const [tier, setTier] = useState<PricingTier>('free');
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [legacyPayment, setLegacyPayment] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [blueprintPurchased, setBlueprintPurchased] = useState(false);
  const [blueprintProduct, setBlueprintProduct] = useState<string | null>(null);

  const loadSubscription = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      // Check test mode first
      if (config.testFullAccess) {
        setTier('pro');
        setIsTestMode(true);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/subscription-status?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setTier(data.tier || 'free');
      setSubscription(data.subscription || null);
      setLegacyPayment(data.legacyPayment || false);
      setDiscountCode(data.discountCode || null);
      // Check Blueprint access
      const bp = await fetchBlueprintAccess(user.email);
      setBlueprintPurchased(bp.purchased);
      setBlueprintProduct(bp.product);
      // Load partner info
      try {
        const partnerRes = await fetch(`/api/partner-lookup?userId=${user.id}`);
        const partnerData = await partnerRes.json();
        if (partnerData.partner) {
          setPartner(partnerData.partner);
          localStorage.setItem('relate_partner_email', partnerData.partner.email);
          if (partnerData.partner.gender) localStorage.setItem('relate_partner_gender', partnerData.partner.gender);
          if (partnerData.partner.results) {
            localStorage.setItem('relate_partner_results', JSON.stringify(partnerData.partner.results));
          }
        }
      } catch { /* ignore */ }
    } catch {
      // Fall back to simple tier check
      const { tier: t } = await fetchPaymentTier(user.email);
      setTier(t);
      const bp = await fetchBlueprintAccess(user.email);
      setBlueprintPurchased(bp.purchased);
      setBlueprintProduct(bp.product);
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.id]);

  useEffect(() => { loadSubscription(); }, [loadSubscription]);

  async function openPortal() {
    if (!user?.email) return;
    setPortalLoading(true);
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Unable to open billing portal. You may not have an active subscription.');
      }
    } catch {
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  }

  const paid = tier !== 'free';
  const tierLabel = PRICING[tier]?.label || tier;
  const tierPrice = PRICING[tier]?.priceDisplay || '$0';

  // Renewal date
  const renewalDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  // Member since
  const memberSince = subscription?.createdAt
    ? new Date(subscription.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  // Discount expiry
  const discountEnd = subscription?.discount?.end
    ? new Date(subscription.discount.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <SubNav />
        <main className="max-w-3xl mx-auto px-6 py-8 w-full">
          <h2 className="font-serif text-2xl font-semibold mb-6">Billing</h2>
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
      <main className="max-w-3xl mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-6">Billing</h2>

        {/* Test mode notice */}
        {isTestMode && (
          <div className="card mb-4 border-warning bg-warning/5">
            <p className="text-sm font-medium">Test Mode Active</p>
            <p className="text-xs text-secondary mt-1">
              You have full Pro access via test mode. Stripe billing is bypassed. This does not affect real subscriptions.
            </p>
          </div>
        )}

        {/* ── Current Plan ── */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-semibold">Current Plan</h3>
            {subscription && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                subscription.status === 'active' ? 'bg-success/10 text-success' :
                subscription.status === 'past_due' ? 'bg-warning/10 text-warning' :
                subscription.status === 'canceled' ? 'bg-danger/10 text-danger' :
                'bg-stone-100 text-secondary'
              }`}>
                {subscription.cancelAtPeriodEnd ? 'Canceling' : subscription.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
              paid ? 'bg-accent/10 text-accent' : 'bg-stone-200 text-secondary'
            }`}>
              {paid ? <Icon name="check" size={18} /> : '-'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{tierLabel}</p>
              <p className="text-xs text-secondary">
                {tier === 'free' && 'Persona code, top 3 matches, 3 advisor messages.'}
                {tier === 'plus' && 'Full report, all 16 matches, PDF download.'}
                {tier === 'premium' && 'Plus features + rate-limited AI advisor + retake assessment.'}
                {tier === 'pro' && 'Everything in Premium + unlimited AI advisor.'}
                {tier === 'couples' && 'Everything for both partners, couples report, shared advisor.'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-xl font-semibold">{tierPrice}</p>
              {paid && !legacyPayment && <p className="text-[10px] text-secondary">per month</p>}
              {legacyPayment && <p className="text-[10px] text-secondary">one-time</p>}
            </div>
          </div>

          {/* Subscription details */}
          {subscription && (
            <div className="pt-3 border-t border-border space-y-2">
              {renewalDate && !subscription.cancelAtPeriodEnd && (
                <div className="flex justify-between text-xs">
                  <span className="text-secondary">Next renewal</span>
                  <span className="font-mono">{renewalDate}</span>
                </div>
              )}
              {subscription.cancelAtPeriodEnd && renewalDate && (
                <div className="flex justify-between text-xs">
                  <span className="text-secondary">Access until</span>
                  <span className="font-mono text-warning">{renewalDate}</span>
                </div>
              )}
              {memberSince && (
                <div className="flex justify-between text-xs">
                  <span className="text-secondary">Member since</span>
                  <span className="font-mono">{memberSince}</span>
                </div>
              )}
            </div>
          )}

          {/* Discount code info */}
          {subscription?.discount && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded">Discount Active</span>
                <span className="text-xs font-medium">{subscription.discount.name}</span>
              </div>
              <p className="text-xs text-secondary">
                {subscription.discount.percentOff && `${subscription.discount.percentOff}% off`}
                {subscription.discount.amountOff && `$${(subscription.discount.amountOff / 100).toFixed(2)} off`}
                {discountEnd && `, expires ${discountEnd}`}
                {!subscription.discount.end && ', no expiration'}
              </p>
            </div>
          )}

          {/* Legacy discount code display */}
          {discountCode && !subscription?.discount && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded">Discount Code</span>
                <span className="text-xs font-mono">{discountCode}</span>
              </div>
            </div>
          )}

          {/* Discount code input — show when no active discount */}
          {!subscription?.discount && !discountCode && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-secondary mb-2">Have a discount code?</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem('code') as HTMLInputElement;
                const code = input?.value?.trim();
                if (!code) return;
                const btn = (e.target as HTMLFormElement).querySelector('button') as HTMLButtonElement;
                btn.disabled = true;
                btn.textContent = 'Applying...';
                try {
                  const res = await fetch('/api/discount-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, email: user?.email }),
                  });
                  const data = await res.json();
                  const existing = (e.target as HTMLFormElement).parentElement?.querySelector('.discount-feedback');
                  if (existing) existing.remove();
                  const p = document.createElement('p');
                  p.className = `text-xs mt-2 discount-feedback ${res.ok && data.success ? 'text-success' : 'text-danger'}`;
                  p.textContent = data.message || data.error || 'Something went wrong';
                  (e.target as HTMLFormElement).after(p);
                  if (res.ok && data.success) {
                    setTimeout(() => window.location.reload(), 1500);
                  }
                } catch {
                  /* ignore */
                } finally {
                  btn.disabled = false;
                  btn.textContent = 'Apply';
                }
              }} className="flex gap-2">
                <input
                  name="code"
                  type="text"
                  placeholder="Enter code"
                  className="input flex-1 text-xs font-mono"
                  style={{ textTransform: 'uppercase' }}
                />
                <button type="submit" className="btn-secondary text-xs whitespace-nowrap">Apply</button>
              </form>
            </div>
          )}
        </div>

        {/* ── Partner Connection ── */}
        {partner && (
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-semibold">Partner</h3>
              <Link href="/invite" className="text-xs text-accent hover:underline">Manage</Link>
            </div>
            <div className="flex items-center gap-4 p-3 bg-success/5 border border-success/20 rounded-md">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-medium flex-shrink-0">
                {partner.firstName ? partner.firstName.charAt(0).toUpperCase() : partner.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {partner.firstName ? `${partner.firstName}${partner.lastName ? ` ${partner.lastName}` : ''}` : partner.email}
                  </p>
                  <span className="text-xs font-mono bg-success/10 text-success px-2 py-0.5 rounded flex-shrink-0">Connected</span>
                </div>
                {partner.firstName && <p className="text-xs text-secondary truncate">{partner.email}</p>}
              </div>
            </div>
            {tier !== 'couples' && (
              <div className="mt-3">
                <p className="text-xs text-secondary mb-2">Upgrade to Couples tier to unlock your compatibility report.</p>
                <a href={`/api/checkout?product=couples&email=${encodeURIComponent(user?.email || '')}`} className="btn-primary text-xs w-full text-center block">
                  Upgrade to Couples
                </a>
              </div>
            )}
            {tier === 'couples' && (
              <Link href="/results/compare" className="btn-secondary text-xs w-full text-center block mt-3">View Couples Results</Link>
            )}
          </div>
        )}

        {/* ── Payment Method ── */}
        {subscription?.paymentMethod && (
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-semibold">Payment Method</h3>
              <button onClick={openPortal} disabled={portalLoading} className="text-xs text-accent hover:underline">
                {portalLoading ? 'Loading...' : 'Update'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-stone-100 border border-border rounded flex items-center justify-center">
                <span className="text-[10px] font-mono uppercase text-secondary">{subscription.paymentMethod.brand}</span>
              </div>
              <div>
                <p className="text-sm font-mono">**** **** **** {subscription.paymentMethod.last4}</p>
                <p className="text-xs text-secondary">
                  Expires {subscription.paymentMethod.expMonth.toString().padStart(2, '0')}/{subscription.paymentMethod.expYear}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Manage Subscription ── */}
        {paid && !isTestMode && (
          <div className="card mb-4">
            <h3 className="font-serif font-semibold mb-4">Manage Subscription</h3>

            {/* Change plan */}
            {tier !== 'couples' && (
              <div className="mb-4">
                <p className="text-xs text-secondary mb-3">Change your plan. Upgrades take effect immediately. Downgrades take effect at the start of your next billing period.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIER_ORDER.filter(t => t !== 'free' && t !== tier).map(t => {
                    const isUpgrade = tierIndex(t) > tierIndex(tier);
                    return (
                      <div key={t} className={`p-3 border rounded-md ${isUpgrade ? 'border-border' : 'border-border opacity-80'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{PRICING[t]?.label}</p>
                          <p className="font-mono text-sm">{PRICING[t]?.priceDisplay}<span className="text-[10px] text-secondary">/mo</span></p>
                        </div>
                        <p className="text-xs text-secondary mb-3">
                          {t === 'plus' && 'All 16 matches, conflict analysis, growth path, PDF report.'}
                          {t === 'premium' && 'Plus features + rate-limited AI advisor + retake.'}
                          {t === 'pro' && 'Everything in Premium + unlimited AI advisor.'}
                          {t === 'couples' && 'Pro for both + compatibility report + shared tools.'}
                        </p>
                        <a
                          href={`/api/checkout?product=${t}&email=${encodeURIComponent(user?.email || '')}`}
                          className={`text-xs w-full text-center block ${isUpgrade ? 'btn-secondary' : 'btn-secondary opacity-80'}`}
                        >
                          {isUpgrade ? `Upgrade to ${PRICING[t]?.label}` : `Downgrade to ${PRICING[t]?.label}`}
                        </a>
                        {!isUpgrade && (
                          <p className="text-[10px] text-secondary mt-2 text-center">Takes effect at the start of your next billing period.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stripe portal actions */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Update payment method</p>
                  <p className="text-xs text-secondary">Change your card or payment details</p>
                </div>
                <button onClick={openPortal} disabled={portalLoading} className="btn-secondary text-xs">
                  {portalLoading ? 'Loading...' : 'Update'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">View billing history</p>
                  <p className="text-xs text-secondary">Download invoices and view past charges</p>
                </div>
                <button onClick={openPortal} disabled={portalLoading} className="btn-secondary text-xs">
                  {portalLoading ? 'Loading...' : 'View'}
                </button>
              </div>

              {!subscription?.cancelAtPeriodEnd && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cancel subscription</p>
                    <p className="text-xs text-secondary">
                      {renewalDate ? `You'll keep access until ${renewalDate}` : 'Cancel your monthly subscription'}
                    </p>
                  </div>
                  <button onClick={openPortal} disabled={portalLoading} className="btn-secondary text-xs">
                    {portalLoading ? 'Loading...' : 'Cancel'}
                  </button>
                </div>
              )}

              {subscription?.cancelAtPeriodEnd && (
                <div className="p-3 bg-warning/5 border border-warning/20 rounded">
                  <p className="text-sm font-medium text-warning">Subscription canceling</p>
                  <p className="text-xs text-secondary mt-1">
                    Your subscription will end on {renewalDate}. You can resubscribe anytime before then to keep your access.
                  </p>
                  <button onClick={openPortal} disabled={portalLoading} className="btn-secondary text-xs mt-2">
                    {portalLoading ? 'Loading...' : 'Resubscribe'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Attachment Style Add-On ── */}
        {!isTestMode && (
          <div className="card mb-4">
            <h3 className="font-serif font-semibold mb-3">Add-Ons</h3>
            {blueprintPurchased ? (
              <div className="flex items-center gap-3 p-3 rounded-md border bg-stone-50 border-stone-300">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-accent/10 text-accent">
                  <Icon name="check" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{blueprintProduct === 'blueprint_couples' ? 'Attachment Style Couples' : 'Attachment Style'}: Active</p>
                  <p className="text-xs text-secondary">Deep attachment style assessment, personalized report, and growth plan.</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-lg font-semibold">{blueprintProduct === 'blueprint_couples' ? BLUEPRINT_PRICING.blueprint_couples.priceDisplay : BLUEPRINT_PRICING.blueprint.priceDisplay}</p>
                  <p className="text-[10px] text-secondary">one-time</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border rounded-md border-accent">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Attachment Style</p>
                    <p className="font-mono text-sm">{BLUEPRINT_PRICING.blueprint.priceDisplay}<span className="text-[10px] text-secondary ml-1">one-time</span></p>
                  </div>
                  <p className="text-xs text-secondary mb-3">A 30-minute deep assessment revealing the psychology underneath your persona. 3,000-word personalized report and growth plan.</p>
                  <a href={`/api/blueprint/checkout?product=blueprint&email=${encodeURIComponent(user?.email || '')}`} className="text-xs w-full text-center block btn-primary">
                    Add Attachment Style
                  </a>
                </div>
                {partner && (
                  <div className="p-3 border rounded-md border-border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">Attachment Style Couples</p>
                      <p className="font-mono text-sm">{BLUEPRINT_PRICING.blueprint_couples.priceDisplay}<span className="text-[10px] text-secondary ml-1">one-time</span></p>
                    </div>
                    <p className="text-xs text-secondary mb-3">Both partners get the full assessment plus a couples overlay report analyzing your dynamic together.</p>
                    <a href={`/api/blueprint/checkout?product=blueprint_couples&email=${encodeURIComponent(user?.email || '')}`} className="text-xs w-full text-center block btn-secondary">
                      Add Attachment Style Couples
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Upgrade CTA for free users ── */}
        {!paid && !isTestMode && (
          <div className="card mb-4">
            <h3 className="font-serif font-semibold mb-3">Upgrade Your Plan</h3>
            <p className="text-xs text-secondary mb-4">Unlock your full results, all matches, and AI coaching.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIER_ORDER.filter(t => t !== 'free').map(t => (
                <div key={t} className={`p-3 border rounded-md ${t === 'premium' ? 'border-accent' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{PRICING[t]?.label}</p>
                    <p className="font-mono text-sm">{PRICING[t]?.priceDisplay}<span className="text-[10px] text-secondary">/mo</span></p>
                  </div>
                  <p className="text-xs text-secondary mb-3">
                    {t === 'plus' && 'All 16 matches, conflict analysis, growth path, PDF report.'}
                    {t === 'premium' && 'Plus features + rate-limited AI advisor + retake.'}
                    {t === 'pro' && 'Everything in Premium + unlimited AI advisor.'}
                    {t === 'couples' && 'Pro for both + compatibility report + shared tools.'}
                  </p>
                  <a
                    href={`/api/checkout?product=${t}&email=${encodeURIComponent(user?.email || '')}`}
                    className={`text-xs w-full text-center block ${t === 'premium' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Get {PRICING[t]?.label}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/account" className="text-xs text-secondary hover:underline">Back to Account</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { PRICING, type PricingTier } from '@/lib/config';
import { fetchPaymentTier } from '@/lib/payments';
import { SiteHeader } from '@/components/SiteHeader';

export default function BillingPage() {
  const { user } = useAuth();
  const [tier, setTier] = useState<PricingTier>('free');

  useEffect(() => {
    if (!user) return;
    fetchPaymentTier(user.email).then(({ tier: t }) => setTier(t));
  }, [user]);

  const paid = tier !== 'free';

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="max-w-md mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-6">Billing</h2>
        <div className="card">
          <h3 className="font-serif font-semibold mb-3">Purchase History</h3>
          {paid ? (
            <div className="flex justify-between text-sm py-2 border-b border-border">
              <span>{PRICING[tier].label}</span>
              <span className="font-mono text-success">Paid</span>
            </div>
          ) : (
            <p className="text-sm text-secondary">No purchases yet.</p>
          )}
        </div>
        {!paid && (
          <div className="mt-4">
            <Link href={`/api/checkout?product=plus&email=${encodeURIComponent(user?.email || '')}`} className="btn-primary text-sm">
              Upgrade to Plus
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

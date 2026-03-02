'use client';

import Link from 'next/link';
import { config } from '@/lib/config';
import { getMockPaymentStatus } from '@/lib/mock/payments';
import { SiteHeader } from '@/components/SiteHeader';

export default function BillingPage() {
  const payment = config.useMockPayments ? getMockPaymentStatus() : { paid: false, tier: 'free' as const };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="max-w-md mx-auto px-6 py-8 w-full">
        <h2 className="font-serif text-2xl font-semibold mb-6">Billing</h2>
        <div className="card">
          <h3 className="font-serif font-semibold mb-3">Purchase History</h3>
          {payment.paid ? (
            <div className="flex justify-between text-sm py-2 border-b border-border">
              <span>{payment.tier === 'couples' ? 'Couples' : payment.tier === 'premium' ? 'Premium' : payment.tier === 'plus' ? 'Plus' : 'Free'}</span>
              <span className="font-mono text-success">Paid</span>
            </div>
          ) : (
            <p className="text-sm text-secondary">No purchases yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

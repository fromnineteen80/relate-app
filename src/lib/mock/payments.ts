'use client';

import type { PricingTier } from '@/lib/config';

export function getMockPaymentStatus(): { paid: boolean; tier: PricingTier } {
  if (typeof window === 'undefined') return { paid: false, tier: 'free' };
  const stored = localStorage.getItem('relate_mock_payment');
  if (stored) {
    const parsed = JSON.parse(stored);
    // Migrate old format
    if (parsed.product && !parsed.tier) {
      const tier = parsed.product === 'couples_report' ? 'couples' : 'premium';
      return { paid: true, tier };
    }
    return parsed;
  }
  return { paid: false, tier: 'free' };
}

export function mockPurchase(tier: PricingTier) {
  const status = { paid: tier !== 'free', tier };
  localStorage.setItem('relate_mock_payment', JSON.stringify(status));
  return status;
}

export function mockResetPayment() {
  localStorage.removeItem('relate_mock_payment');
}

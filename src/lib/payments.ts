'use client';

import { config, type PricingTier } from '@/lib/config';
import { getMockPaymentStatus } from '@/lib/mock/payments';

const TIER_PRIORITY: Record<PricingTier, number> = {
  free: 0,
  plus: 1,
  premium: 2,
  pro: 3,
  couples: 4,
};

/**
 * Fetches the current user's payment tier.
 * In mock mode, reads from localStorage.
 * In real mode, calls /api/payment-status which queries the Supabase payments table.
 */
export async function fetchPaymentTier(email?: string): Promise<{ paid: boolean; tier: PricingTier }> {
  // Test mode: bypass payments, grant full access. Stripe still works if used.
  if (config.testFullAccess) {
    return { paid: true, tier: 'pro' };
  }

  if (config.useMockPayments) {
    return getMockPaymentStatus();
  }

  // Check localStorage cache first for instant UI
  const cached = localStorage.getItem('relate_payment_tier');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.tier && parsed.timestamp && Date.now() - parsed.timestamp < 60_000) {
        return { paid: parsed.tier !== 'free', tier: parsed.tier };
      }
    } catch { /* ignore */ }
  }

  if (!email) {
    return { paid: false, tier: 'free' };
  }

  try {
    const res = await fetch(`/api/payment-status?email=${encodeURIComponent(email)}`);
    if (!res.ok) return { paid: false, tier: 'free' };
    const data = await res.json();
    const tier: PricingTier = data.tier || 'free';

    // Cache for 60 seconds
    localStorage.setItem('relate_payment_tier', JSON.stringify({ tier, timestamp: Date.now() }));

    return { paid: tier !== 'free', tier };
  } catch {
    return { paid: false, tier: 'free' };
  }
}

/**
 * Force-refresh the payment tier (e.g., after checkout redirect).
 * Clears cache and fetches fresh from the server.
 */
export async function refreshPaymentTier(email?: string): Promise<{ paid: boolean; tier: PricingTier }> {
  localStorage.removeItem('relate_payment_tier');
  return fetchPaymentTier(email);
}

/**
 * Returns the higher of two tiers.
 */
export function higherTier(a: PricingTier, b: PricingTier): PricingTier {
  return TIER_PRIORITY[a] >= TIER_PRIORITY[b] ? a : b;
}

/**
 * Checks if the user has purchased the Blueprint add-on.
 * Returns { purchased: boolean, product: 'blueprint' | 'blueprint_couples' | null }
 */
export async function fetchBlueprintAccess(email?: string): Promise<{ purchased: boolean; product: 'blueprint' | 'blueprint_couples' | null }> {
  if (config.testFullAccess || (config as any).testBlueprintAccess) {
    return { purchased: true, product: 'blueprint' };
  }

  if (config.useMockPayments) {
    const stored = localStorage.getItem('relate_blueprint_purchased');
    if (stored) return JSON.parse(stored);
    return { purchased: false, product: null };
  }

  // Check localStorage cache
  const cached = localStorage.getItem('relate_blueprint_access');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && Date.now() - parsed.timestamp < 60_000) {
        return { purchased: parsed.purchased, product: parsed.product };
      }
    } catch { /* ignore */ }
  }

  if (!email) return { purchased: false, product: null };

  try {
    const res = await fetch(`/api/payment-status?email=${encodeURIComponent(email)}&check=blueprint`);
    if (!res.ok) return { purchased: false, product: null };
    const data = await res.json();
    const result = { purchased: !!data.blueprintProduct, product: data.blueprintProduct || null };
    localStorage.setItem('relate_blueprint_access', JSON.stringify({ ...result, timestamp: Date.now() }));
    return result;
  } catch {
    return { purchased: false, product: null };
  }
}

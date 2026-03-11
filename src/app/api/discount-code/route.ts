import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { PricingTier } from '@/lib/config';

/**
 * Discount code format: {PERCENT}-{TIER}-{MONTH}-{YEAR}
 * Examples: 100-PRO-MARCH-2026, 50-PREMIUM-MARCH-2026, 100-PLUS-APRIL-2026, 100-COUPLES-MARCH-2026
 *           100-ATTACH-MARCH-2026 (Attachment style add-on)
 *           100-ATTACHCOUPLES-MARCH-2026 (Attachment style couples add-on)
 *
 * - PERCENT: 100 = fully free, 50 = half price, etc.
 * - TIER: PLUS, PREMIUM, PRO, COUPLES, ATTACH, ATTACHCOUPLES
 * - MONTH: Full month name, uppercase
 * - YEAR: 4-digit year
 *
 * A 100% code grants immediate access (no payment needed).
 * Codes are valid only during the specified month+year.
 */

type ProductKey = PricingTier | 'attachment_style' | 'attachment_style_couples';

const VALID_TIERS: Record<string, ProductKey> = {
  PLUS: 'plus',
  PREMIUM: 'premium',
  PRO: 'pro',
  COUPLES: 'couples',
  ATTACH: 'attachment_style',
  ATTACHCOUPLES: 'attachment_style_couples',
};

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

function parseDiscountCode(code: string): { percent: number; tier: ProductKey; month: number; year: number } | null {
  const parts = code.toUpperCase().trim().split('-');
  if (parts.length !== 4) return null;

  const percent = parseInt(parts[0], 10);
  if (isNaN(percent) || percent < 1 || percent > 100) return null;

  const tierKey = parts[1];
  const tier = VALID_TIERS[tierKey];
  if (!tier) return null;

  const monthIndex = MONTHS.indexOf(parts[2]);
  if (monthIndex === -1) return null;

  const year = parseInt(parts[3], 10);
  if (isNaN(year) || year < 2025 || year > 2030) return null;

  return { percent, tier, month: monthIndex, year };
}

export async function POST(request: NextRequest) {
  try {
    const { code, email, partnerEmail } = await request.json();

    if (!code || !email) {
      return NextResponse.json({ error: 'Code and email are required' }, { status: 400 });
    }

    const parsed = parseDiscountCode(code);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid discount code format' }, { status: 400 });
    }

    // Check if code is valid for current month
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentYear = now.getFullYear();

    if (parsed.month !== currentMonth || parsed.year !== currentYear) {
      return NextResponse.json({ error: 'This discount code has expired' }, { status: 400 });
    }

    // For 100% discount, grant access immediately by inserting a payment record
    if (parsed.percent === 100) {
      const supabase = createServerClient();
      const timestamp = Date.now();

      // Grant access to the primary user
      await supabase.from('payments').insert({
        customer_email: email,
        product: parsed.tier,
        amount: 0,
        stripe_session_id: `discount_${code}_${timestamp}`,
        stripe_payment_intent: `discount_${code}`,
        status: 'completed',
      });

      // For couples tier or attachment_style_couples, also grant access to partner if provided
      if ((parsed.tier === 'couples' || parsed.tier === 'attachment_style_couples') && partnerEmail) {
        await supabase.from('payments').insert({
          customer_email: partnerEmail,
          product: parsed.tier,
          amount: 0,
          stripe_session_id: `discount_${code}_partner_${timestamp}`,
          stripe_payment_intent: `discount_${code}_partner`,
          status: 'completed',
        });
      }

      return NextResponse.json({
        success: true,
        tier: parsed.tier,
        percent: parsed.percent,
        message: `Access granted: ${parsed.tier.charAt(0).toUpperCase() + parsed.tier.slice(1)} tier activated${partnerEmail ? ' for both partners' : ''}`,
      });
    }

    // For partial discounts, we'd redirect to Stripe with a coupon
    // For now, return the discount info so the frontend can apply it
    return NextResponse.json({
      success: true,
      tier: parsed.tier,
      percent: parsed.percent,
      message: `${parsed.percent}% discount applied for ${parsed.tier.charAt(0).toUpperCase() + parsed.tier.slice(1)} tier`,
    });
  } catch (error: unknown) {
    console.error('Discount code error:', error);
    return NextResponse.json({ error: 'Failed to process discount code' }, { status: 500 });
  }
}

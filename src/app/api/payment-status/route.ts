import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { PricingTier } from '@/lib/config';

const TIER_PRIORITY: Record<string, number> = {
  free: 0,
  plus: 1,
  premium: 2,
  couples: 3,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ tier: 'free' });
  }

  try {
    const supabase = createServerClient();

    // Query completed payments for this email, ordered by tier priority
    const { data: payments, error } = await supabase
      .from('payments')
      .select('product, status, customer_email')
      .eq('customer_email', email)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error || !payments || payments.length === 0) {
      return NextResponse.json({ tier: 'free' });
    }

    // Find the highest tier among all completed payments
    let highestTier: PricingTier = 'free';
    for (const payment of payments) {
      const tier = payment.product as string;
      if (tier in TIER_PRIORITY && TIER_PRIORITY[tier] > TIER_PRIORITY[highestTier]) {
        highestTier = tier as PricingTier;
      }
    }

    return NextResponse.json({ tier: highestTier });
  } catch (err) {
    console.error('Payment status error:', err);
    return NextResponse.json({ tier: 'free' });
  }
}

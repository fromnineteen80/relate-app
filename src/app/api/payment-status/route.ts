import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { PricingTier } from '@/lib/config';

const TIER_PRIORITY: Record<string, number> = {
  free: 0,
  plus: 1,
  premium: 2,
  pro: 3,
  couples: 4,
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
    let blueprintProduct: string | null = null;
    for (const payment of payments) {
      const product = payment.product as string;
      if (product in TIER_PRIORITY && TIER_PRIORITY[product] > TIER_PRIORITY[highestTier]) {
        highestTier = product as PricingTier;
      }
      // Track Blueprint add-on purchases (blueprint_couples supersedes blueprint)
      if (product === 'blueprint_couples') {
        blueprintProduct = 'blueprint_couples';
      } else if (product === 'blueprint' && blueprintProduct !== 'blueprint_couples') {
        blueprintProduct = 'blueprint';
      }
    }

    return NextResponse.json({ tier: highestTier, blueprintProduct });
  } catch (err) {
    console.error('Payment status error:', err);
    return NextResponse.json({ tier: 'free' });
  }
}

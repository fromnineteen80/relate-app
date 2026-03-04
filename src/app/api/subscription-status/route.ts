import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { PricingTier } from '@/lib/config';

const TIER_PRIORITY: Record<string, number> = {
  free: 0, plus: 1, premium: 2, pro: 3, couples: 4,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ tier: 'free', subscription: null });
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Find Stripe customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    let subscription = null;
    let stripeSubscription = null;

    if (customer) {
      // Get active subscriptions
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      });

      if (subs.data.length === 0) {
        // Also check for past_due or trialing
        const otherSubs = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 1,
        });
        if (otherSubs.data.length > 0) {
          stripeSubscription = otherSubs.data[0];
        }
      } else {
        stripeSubscription = subs.data[0];
      }
    }

    if (stripeSubscription) {
      const product = stripeSubscription.metadata?.product || 'plus';

      // Get the default payment method
      let paymentMethod = null;
      const pmId = stripeSubscription.default_payment_method || customer?.invoice_settings?.default_payment_method;
      if (pmId) {
        try {
          const pm = await stripe.paymentMethods.retrieve(pmId);
          if (pm.card) {
            paymentMethod = {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            };
          }
        } catch { /* ignore */ }
      }

      // Check for discount/coupon
      let discount = null;
      if (stripeSubscription.discount) {
        const d = stripeSubscription.discount;
        discount = {
          name: d.coupon?.name || d.coupon?.id || 'Discount',
          percentOff: d.coupon?.percent_off || null,
          amountOff: d.coupon?.amount_off || null,
          end: d.end ? new Date(d.end * 1000).toISOString() : null,
        };
      }

      subscription = {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        product,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        cancelAt: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000).toISOString() : null,
        createdAt: new Date(stripeSubscription.created * 1000).toISOString(),
        paymentMethod,
        discount,
      };

      return NextResponse.json({ tier: product as PricingTier, subscription });
    }

    // Fall back to checking Supabase payments (legacy one-time purchases & discount codes)
    const supabase = createServerClient();
    const { data: payments } = await supabase
      .from('payments')
      .select('product, status, stripe_session_id, created_at')
      .eq('customer_email', email)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (payments && payments.length > 0) {
      let highestTier: PricingTier = 'free';
      let discountCode: string | null = null;
      for (const payment of payments) {
        const tier = payment.product as string;
        if (tier in TIER_PRIORITY && TIER_PRIORITY[tier] > TIER_PRIORITY[highestTier]) {
          highestTier = tier as PricingTier;
        }
        if (payment.stripe_session_id?.startsWith('discount_')) {
          discountCode = payment.stripe_session_id.replace('discount_', '').replace(/_\d+$/, '');
        }
      }
      return NextResponse.json({
        tier: highestTier,
        subscription: null,
        legacyPayment: true,
        discountCode,
      });
    }

    return NextResponse.json({ tier: 'free', subscription: null });
  } catch (err) {
    console.error('Subscription status error:', err);
    return NextResponse.json({ tier: 'free', subscription: null });
  }
}

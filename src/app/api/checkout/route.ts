import { NextRequest, NextResponse } from 'next/server';
import { PRICING, type PricingTier } from '@/lib/config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const product = (searchParams.get('product') || 'plus') as PricingTier;
  const email = searchParams.get('email') || '';
  const useMockPayments = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true';
  const origin = process.env.NEXT_PUBLIC_URL || new URL(request.url).origin;

  if (!PRICING[product] || product === 'free') {
    return NextResponse.redirect(new URL('/account?error=invalid_product', origin));
  }

  if (useMockPayments) {
    const successPath = product === 'couples' ? '/results/compare?success=true' : '/account?success=true';
    return NextResponse.redirect(new URL(`${successPath}&product=${product}`, origin));
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const tier = PRICING[product];

    const successUrl = product === 'couples'
      ? `${origin}/results/compare?success=true`
      : `${origin}/account?success=true`;

    const cancelUrl = product === 'couples'
      ? `${origin}/results/compare?canceled=true`
      : `${origin}/account?canceled=true`;

    // Find or create a Stripe customer for this email
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email });
        customerId = customer.id;
      }
    }

    const sessionConfig: Record<string, unknown> = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `RELATE ${tier.label}` },
          unit_amount: tier.stripeCents,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { product },
      subscription_data: {
        metadata: { product },
      },
    };

    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    if (!session.url) {
      return NextResponse.redirect(new URL('/account?error=checkout_no_url', origin));
    }

    // Use 303 See Other for the redirect to Stripe
    return NextResponse.redirect(session.url, 303);
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    // Never return raw JSON — redirect back with error flag
    return NextResponse.redirect(new URL(`/account?error=checkout_failed`, origin));
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PRICING, type PricingTier } from '@/lib/config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const product = (searchParams.get('product') || 'plus') as PricingTier;
  const email = searchParams.get('email') || '';
  const useMockPayments = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true';

  if (!PRICING[product] || product === 'free') {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
  }

  if (useMockPayments) {
    const successPath = product === 'couples' ? '/results/compare?success=true' : '/account?success=true';
    return NextResponse.redirect(new URL(`${successPath}&product=${product}`, request.url));
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const tier = PRICING[product];

    const successUrl = product === 'couples'
      ? `${process.env.NEXT_PUBLIC_URL}/results/compare?success=true`
      : `${process.env.NEXT_PUBLIC_URL}/account?success=true`;

    const cancelUrl = product === 'couples'
      ? `${process.env.NEXT_PUBLIC_URL}/results/compare?canceled=true`
      : `${process.env.NEXT_PUBLIC_URL}/account?canceled=true`;

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

    return NextResponse.redirect(session.url);
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}

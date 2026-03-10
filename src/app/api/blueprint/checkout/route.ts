import { NextRequest, NextResponse } from 'next/server';
import { BLUEPRINT_PRICING, type BlueprintProduct } from '@/lib/config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const product = (searchParams.get('product') || 'blueprint') as BlueprintProduct;
  const email = searchParams.get('email') || '';
  const useMockPayments = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true';
  const origin = process.env.NEXT_PUBLIC_URL || new URL(request.url).origin;

  if (!BLUEPRINT_PRICING[product]) {
    return NextResponse.redirect(new URL('/blueprint?error=invalid_product', origin));
  }

  if (useMockPayments) {
    return NextResponse.redirect(new URL(`/blueprint?success=true&product=${product}`, origin));
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const tier = BLUEPRINT_PRICING[product];

    const productName = product === 'blueprint_couples'
      ? 'RELATE Blueprint Couples'
      : 'RELATE Blueprint';

    const successUrl = `${origin}/blueprint?success=true&product=${product}`;
    const cancelUrl = `${origin}/results?canceled=true`;

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
          product_data: { name: productName },
          unit_amount: tier.stripeCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { product },
    };

    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    if (!session.url) {
      return NextResponse.redirect(new URL('/blueprint?error=checkout_no_url', origin));
    }

    // Use 303 See Other for the redirect to Stripe
    return NextResponse.redirect(session.url, 303);
  } catch (error: unknown) {
    console.error('Blueprint checkout error:', error);
    // Never return raw JSON — redirect back with error flag
    return NextResponse.redirect(new URL('/blueprint?error=checkout_failed', origin));
  }
}

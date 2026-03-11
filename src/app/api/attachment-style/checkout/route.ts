import { NextRequest, NextResponse } from 'next/server';
import { ATTACHMENT_PRICING, type AttachmentProduct } from '@/lib/config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const product = (searchParams.get('product') || 'attachment_style') as AttachmentProduct;
  const email = searchParams.get('email') || '';
  const useMockPayments = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true';
  const origin = process.env.NEXT_PUBLIC_URL || new URL(request.url).origin;

  if (!ATTACHMENT_PRICING[product]) {
    return NextResponse.redirect(new URL('/attachment-style?error=invalid_product', origin));
  }

  if (useMockPayments) {
    return NextResponse.redirect(new URL(`/attachment-style?success=true&product=${product}`, origin));
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const tier = ATTACHMENT_PRICING[product];

    const productName = product === 'attachment_style_couples'
      ? 'RELATE Attachment Style Couples'
      : 'RELATE Attachment Style';

    const successUrl = `${origin}/attachment-style?success=true&product=${product}`;
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
      return NextResponse.redirect(new URL('/attachment-style?error=checkout_no_url', origin));
    }

    // Use 303 See Other for the redirect to Stripe
    return NextResponse.redirect(session.url, 303);
  } catch (error: unknown) {
    console.error('Attachment style checkout error:', error);
    // Never return raw JSON — redirect back with error flag
    return NextResponse.redirect(new URL('/attachment-style?error=checkout_failed', origin));
  }
}

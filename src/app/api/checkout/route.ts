import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get('product') || 'full_report';
  const useMockPayments = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true';

  if (useMockPayments) {
    // In mock mode, redirect directly to success
    return NextResponse.redirect(new URL(`/results?success=true&product=${product}`, request.url));
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const prices: Record<string, { name: string; amount: number }> = {
      full_report: { name: 'RELATE Full Report', amount: 1900 },
      couples_report: { name: 'RELATE Couples Report', amount: 2900 },
    };

    const { name, amount } = prices[product] || prices.full_report;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: { currency: 'usd', product_data: { name }, unit_amount: amount },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/results?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/results?canceled=true`,
      metadata: { product },
    });

    return NextResponse.redirect(session.url);
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}

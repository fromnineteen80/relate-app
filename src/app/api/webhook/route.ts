import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    const supabase = createServerClient();

    switch (event.type) {
      // New subscription created via checkout
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { product } = session.metadata || {};
        const customerEmail = session.customer_email || session.customer_details?.email || null;

        if (session.mode === 'subscription') {
          // Subscription checkout — record with subscription ID
          await supabase.from('payments').insert({
            product: product || 'plus',
            amount: session.amount_total,
            stripe_session_id: session.id,
            stripe_payment_intent: session.subscription || session.payment_intent,
            customer_email: customerEmail,
            status: 'completed',
          });
        } else {
          // Legacy one-time payment
          await supabase.from('payments').insert({
            product: product || 'plus',
            amount: session.amount_total,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent,
            customer_email: customerEmail,
            status: 'completed',
          });
        }
        break;
      }

      // Recurring invoice paid — keep subscription active
      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email;
        const subscriptionId = invoice.subscription;
        if (subscriptionId && customerEmail) {
          // Fetch the subscription to get the product metadata
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const product = sub.metadata?.product || 'plus';
          // Upsert: ensure the latest payment is recorded
          const { data: existing } = await supabase
            .from('payments')
            .select('id')
            .eq('customer_email', customerEmail)
            .eq('stripe_payment_intent', subscriptionId)
            .limit(1);
          if (!existing || existing.length === 0) {
            await supabase.from('payments').insert({
              product,
              amount: invoice.amount_paid,
              stripe_session_id: `invoice_${invoice.id}`,
              stripe_payment_intent: subscriptionId,
              customer_email: customerEmail,
              status: 'completed',
            });
          }
        }
        break;
      }

      // Subscription canceled or expired
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        // Look up customer email
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;
        if (email) {
          // Mark all payments for this subscription as canceled
          await supabase
            .from('payments')
            .update({ status: 'refunded' })
            .eq('customer_email', email)
            .eq('stripe_payment_intent', sub.id);
        }
        break;
      }

      // Subscription updated (plan change, etc.)
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const newProduct = sub.metadata?.product;
        if (newProduct) {
          const customerId = sub.customer;
          const customer = await stripe.customers.retrieve(customerId);
          const email = customer.email;
          if (email) {
            // Update the product on the payment record
            await supabase
              .from('payments')
              .update({ product: newProduct })
              .eq('customer_email', email)
              .eq('stripe_payment_intent', sub.id);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}

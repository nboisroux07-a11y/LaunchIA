import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

export async function POST(request) {
  try {
    const { planType } = await request.json(); 
    // Types acceptés : 'one_time' (39.99€), 'sub_2_shops' (59.99€), 'sub_5_shops' (89.99€)

    let unitAmount = 3999; // 39.99 €
    let mode = 'payment';

    if (planType === 'sub_2_shops') {
      unitAmount = 5999; // 59.99 €
      mode = 'subscription';
    } else if (planType === 'sub_5_shops') {
      unitAmount = 8999; // 89.99 €
      mode = 'subscription';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `LaunchFlow.ai — Offre ${planType}`,
            },
            unit_amount: unitAmount,
            ...(mode === 'subscription' && { recurring: { interval: 'month' } }),
          },
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${request.headers.get('origin')}/?payment=success`,
      cancel_url: `${request.headers.get('origin')}/?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur Stripe API:", error);
    return NextResponse.json({ error: "Impossible d'initialiser Stripe." }, { status: 500 });
  }
}
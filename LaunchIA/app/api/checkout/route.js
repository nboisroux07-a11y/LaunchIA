import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Les paiements ne sont pas encore configurés : ajoute STRIPE_SECRET_KEY dans les variables Vercel." }, { status: 503 });
    }
    const { planType } = await request.json();
    const plans = {
      one_time: { unitAmount: 3999, mode: "payment", name: "Découverte" },
      sub_2_shops: { unitAmount: 5999, mode: "subscription", name: "Croissance" },
      sub_5_shops: { unitAmount: 8999, mode: "subscription", name: "Scale" }
    };
    const plan = plans[planType];
    if (!plan) return NextResponse.json({ error: "Offre inconnue." }, { status: 400 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = request.headers.get("origin");
    if (!origin) return NextResponse.json({ error: "Origine de la requête introuvable." }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `LaunchFlow.ai — Offre ${plan.name}` },
          unit_amount: plan.unitAmount,
          ...(plan.mode === "subscription" ? { recurring: { interval: "month" } } : {})
        },
        quantity: 1
      }],
      mode: plan.mode,
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur Stripe API:", error);
    return NextResponse.json({ error: "Impossible d'initialiser le paiement Stripe." }, { status: 500 });
  }
}
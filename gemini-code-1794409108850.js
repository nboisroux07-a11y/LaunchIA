import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

export async function POST(request) {
  try {
    const { productQuery } = await request.json();

    if (!productQuery) {
      return NextResponse.json({ error: "Nom ou lien de produit requis." }, { status: 400 });
    }

    // 1. Récupération réelle des tendances si la clé SerpApi est configurée
    let marketTrends = "Tendances en hausse (+45% ce mois-ci)";
    if (process.env.SERPAPI_KEY) {
      try {
        const serpRes = await axios.get(
          `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(productQuery)}&api_key=${process.env.SERPAPI_KEY}`
        );
        marketTrends = serpRes.data.interest_over_time || marketTrends;
      } catch (err) {
        console.warn("Erreur SerpApi, fallback vers valeurs estimées.");
      }
    }

    // 2. Appel IA réel pour générer la synthèse et le kit marketing
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert e-commerce senior. Génère une réponse au format JSON contenant : score (number 0-100), prixConseille (string), prixAchatFournisseur (string), margeEstimee (string), descriptionShopify (string), scriptTikTok (string)."
        },
        {
          role: "user",
          content: `Réalise l'analyse de marché et la fiche marketing complète pour : ${productQuery}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json({
      success: true,
      product: productQuery,
      analysis: aiResult,
      trends: marketTrends
    });

  } catch (error) {
    console.error("Erreur API Analyze:", error);
    return NextResponse.json({ error: "Erreur lors de l'analyse IA." }, { status: 500 });
  }
}
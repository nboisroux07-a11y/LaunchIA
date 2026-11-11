import { NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { productQuery } = await request.json();
    if (typeof productQuery !== "string" || !productQuery.trim()) {
      return NextResponse.json({ error: "Nom ou lien de produit requis." }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "La variable OPENAI_API_KEY n'est pas configurée sur Vercel." }, { status: 503 });
    }

    let marketTrends = "Données de tendances indisponibles pour le moment.";
    if (process.env.SERPAPI_KEY) {
      try {
        const serpRes = await axios.get("https://serpapi.com/search.json", {
          params: { engine: "google_trends", q: productQuery.trim(), api_key: process.env.SERPAPI_KEY },
          timeout: 15000
        });
        marketTrends = serpRes.data?.interest_over_time ?? serpRes.data?.interest_over_time_timeline ?? marketTrends;
      } catch (err) {
        console.warn("SerpAPI indisponible :", err.message);
      }
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert e-commerce. Réponds uniquement avec un objet JSON valide contenant score (nombre de 0 à 100), prixConseille (texte), prixAchatFournisseur (texte), margeEstimee (texte), descriptionShopify (texte) et scriptTikTok (texte). N'invente pas de données de marché vérifiées : précise les estimations."
        },
        { role: "user", content: `Analyse ce produit et prépare une fiche marketing : ${productQuery.trim()}. Données de tendance disponibles : ${JSON.stringify(marketTrends)}` }
      ],
      response_format: { type: "json_object" }
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    const analysis = JSON.parse(raw);
    return NextResponse.json({ success: true, product: productQuery.trim(), analysis, trends: marketTrends });
  } catch (error) {
    console.error("Erreur API Analyze:", error);
    return NextResponse.json({ error: "Erreur lors de l'analyse IA. Vérifie les clés API et réessaie." }, { status: 500 });
  }
}
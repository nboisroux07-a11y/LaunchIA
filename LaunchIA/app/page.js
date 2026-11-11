 "use client";

import { useState } from "react";

const plans = [
  { id: "one_time", name: "Découverte", price: "39,99 €", detail: "Paiement unique" },
  { id: "sub_2_shops", name: "Croissance", price: "59,99 €", detail: "Par mois · jusqu'à 2 boutiques", featured: true },
  { id: "sub_5_shops", name: "Scale", price: "89,99 €", detail: "Par mois · jusqu'à 5 boutiques" }
];

export default function Home() {
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState("");

  async function analyze(event) {
    event.preventDefault();
    if (!product.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productQuery: product.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "L'analyse n'a pas pu aboutir.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function checkout(planType) {
    setPaying(planType);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Paiement indisponible.");
      if (data.url) window.location.href = data.url;
      else throw new Error("Lien de paiement absent.");
    } catch (err) {
      setError(err.message || "Impossible de lancer le paiement.");
      setPaying("");
    }
  }

  return (
    <main>
      <nav className="nav wrap">
        <a className="brand" href="#"><span className="brand-mark">L</span> LaunchFlow<span className="brand-ai">.AI</span></a>
        <a className="nav-link" href="#offres">Nos offres <span>↗</span></a>
      </nav>

      <section className="hero wrap">
        <div className="eyebrow"><span className="pulse" /> L'ASSISTANT IA DES ENTREPRENEURS E-COMMERCE</div>
        <h1>Trouvez votre prochain<br /><span>produit gagnant.</span></h1>
        <p className="hero-copy">Analysez le potentiel d'un produit, explorez les tendances du marché et générez votre kit marketing avec l'intelligence artificielle.</p>

        <form className="analyzer" onSubmit={analyze}>
          <label htmlFor="product">Quel produit souhaitez-vous analyser ?</label>
          <div className="search-row">
            <input id="product" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex. : gourde isotherme, lampe coucher de soleil…" />
            <button type="submit" disabled={loading || !product.trim()}>{loading ? "Analyse…" : "Analyser le produit"} <span>→</span></button>
          </div>
          <small>Vous pouvez saisir un nom de produit ou une URL.</small>
        </form>

        {error && <div className="error" role="alert">{error}</div>}
        {loading && <div className="loading"><span className="spinner" /> Analyse du produit en cours…</div>}

        {result && (
          <section className="results" aria-live="polite">
            <div className="result-head">
              <div><div className="eyebrow">RAPPORT D'ANALYSE</div><h2>{result.product}</h2></div>
              <div className="score"><strong>{result.analysis?.score ?? "—"}</strong><span>/100</span><small>Score IA</small></div>
            </div>
            <div className="result-grid">
              <article className="result-card"><span>Prix conseillé</span><strong>{result.analysis?.prixConseille || "Non renseigné"}</strong></article>
              <article className="result-card"><span>Prix fournisseur estimé</span><strong>{result.analysis?.prixAchatFournisseur || "Non renseigné"}</strong></article>
              <article className="result-card"><span>Marge estimée</span><strong>{result.analysis?.margeEstimee || "Non renseignée"}</strong></article>
            </div>
            <article className="result-card long"><h3>Description Shopify</h3><p>{result.analysis?.descriptionShopify || "Aucune description fournie."}</p></article>
            <article className="result-card long"><h3>Script TikTok</h3><p>{result.analysis?.scriptTikTok || "Aucun script fourni."}</p></article>
            <article className="result-card long"><h3>Tendances du marché</h3><pre>{typeof result.trends === "string" ? result.trends : JSON.stringify(result.trends, null, 2)}</pre></article>
            <p className="disclaimer">Les estimations générées par IA sont indicatives et doivent être vérifiées avant toute décision commerciale.</p>
          </section>
        )}
      </section>

      <section className="features wrap">
        <div className="section-kicker">VOTRE BOÎTE À OUTILS</div>
        <h2>De l'idée au lancement,<br /><span>plus simplement.</span></h2>
        <div className="feature-grid">
          <article><div className="feature-icon">⌕</div><h3>Analyse produit</h3><p>Obtenez une première lecture du potentiel commercial de votre idée.</p></article>
          <article><div className="feature-icon">↗</div><h3>Tendances marché</h3><p>Consultez les données de tendance disponibles pour votre recherche.</p></article>
          <article><div className="feature-icon">✦</div><h3>Kit marketing IA</h3><p>Préparez une description produit et un script vidéo pour démarrer.</p></article>
        </div>
      </section>

      <section className="pricing wrap" id="offres">
        <div className="section-kicker">TARIFS</div>
        <h2>Choisissez votre <span>rythme.</span></h2>
        <p className="pricing-copy">Des offres simples pour faire avancer vos projets e-commerce.</p>
        <div className="plan-grid">
          {plans.map((plan) => (
            <article className={`plan ${plan.featured ? "featured" : ""}`} key={plan.id}>
              {plan.featured && <div className="popular">LE PLUS CHOISI</div>}
              <h3>{plan.name}</h3><div className="plan-price">{plan.price}</div><p>{plan.detail}</p>
              <button onClick={() => checkout(plan.id)} disabled={!!paying}>{paying === plan.id ? "Ouverture…" : "Choisir cette offre"}</button>
            </article>
          ))}
        </div>
        <p className="disclaimer">Le paiement est traité de manière sécurisée par Stripe. Les offres récurrentes sont des abonnements mensuels.</p>
      </section>

      <footer className="footer"><div className="wrap footer-inner"><a className="brand" href="#"><span className="brand-mark">L</span> LaunchFlow<span className="brand-ai">.AI</span></a><span>© {new Date().getFullYear()} LaunchFlow AI</span></div></footer>
    </main>
  );
}
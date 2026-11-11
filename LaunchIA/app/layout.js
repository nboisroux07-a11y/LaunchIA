import "./globals.css";

export const metadata = {
  title: "LaunchFlow.ai — Analyse e-commerce par IA",
  description: "Analysez vos idées de produits, les tendances et votre potentiel e-commerce avec LaunchFlow AI."
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
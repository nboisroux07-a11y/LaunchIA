import './globals.css';

export const metadata = {
  title: 'LaunchFlow.ai — Plateforme IA E-Commerce Tout-en-Un',
  description: 'Analyse de marché, sourcing et génération de boutiques e-commerce par IA.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" class="dark">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body class="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
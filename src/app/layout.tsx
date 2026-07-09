import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { config } from "@/lib/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdSense } from "@/components/analytics/AdSense";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import "./globals.css";

// Dados estruturados globais (schema.org) — ajudam o Google a entender a marca
// e podem habilitar sitelinks/knowledge panel.
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: config.site.name,
  url: config.site.url,
  logo: absoluteUrl("/logo-horariodeonibusdf.png"),
  description: config.site.description,
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: config.site.name,
  url: config.site.url,
  inLanguage: "pt-BR",
  description: config.site.description,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Metadados base. `metadataBase` permite que canonicals e URLs de Open Graph
 * relativas sejam resolvidas em absolutas automaticamente pelo Next.
 */
export const metadata: Metadata = {
  metadataBase: new URL(config.site.url),
  title: {
    default: `${config.site.name} — Horários, Linhas e Itinerários`,
    template: `%s | ${config.site.name}`,
  },
  description: config.site.description,
  applicationName: config.site.name,
  icons: {
    icon: "/logo-icon-horariodeonibusdf.png",
    apple: "/logo-icon-horariodeonibusdf.png",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Google AdSense (Auto Ads) — não bloqueia renderização. */}
        <AdSense />
        {/* Dados estruturados globais. */}
        <JsonLd data={organizationLd} />
        <JsonLd data={websiteLd} />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        {/* Link de pular para o conteúdo (acessibilidade). */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Pular para o conteúdo
        </a>

        <Header />

        <main id="conteudo" className="flex-1">
          {children}
        </main>

        <Footer />

        {/* Google Analytics 4 — carregado de forma otimizada. */}
        {config.analytics.gaId && (
          <GoogleAnalytics gaId={config.analytics.gaId} />
        )}
      </body>
    </html>
  );
}

import Script from "next/script";
import { config } from "@/lib/config";

/**
 * Google AdSense — Auto Ads (anúncios automáticos).
 *
 * Para Auto Ads, basta o script "page-level" carregado no <head> com o client
 * ID; o Google injeta e posiciona os anúncios sozinho conforme as configurações
 * do painel (NÃO usamos blocos <ins class="adsbygoogle"> manuais).
 *
 * Renderiza também a meta tag `google-adsense-account`, o método atual de
 * verificação de propriedade do site (fica no HTML inicial, via SSR).
 *
 * Observação de deploy: `NEXT_PUBLIC_ADSENSE_CLIENT` é inlined no build — nas
 * páginas estáticas o script/meta são "assados" em tempo de build, então a
 * variável precisa existir no `docker build` (ver build args no Dockerfile).
 */
export function AdSense() {
  const client = config.analytics.adsenseClient;
  if (!client) return null;

  return (
    <>
      {/* Verificação de propriedade (SSR no <head>). */}
      <meta name="google-adsense-account" content={client} />

      {/* Loader do AdSense — habilita os Auto Ads. */}
      <Script
        id="google-adsense"
        strategy="afterInteractive"
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      />
    </>
  );
}

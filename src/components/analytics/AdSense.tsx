import Script from "next/script";
import { config } from "@/lib/config";

/**
 * Tag do Google AdSense (Auto Ads).
 *
 * Carregada com `strategy="afterInteractive"` para NÃO bloquear a renderização
 * inicial da página. O script só é injetado se o client ID estiver configurado.
 */
export function AdSense() {
  const client = config.analytics.adsenseClient;
  if (!client) return null;

  return (
    <Script
      id="google-adsense"
      strategy="afterInteractive"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}

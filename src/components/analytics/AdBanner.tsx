"use client";

import { useEffect, useRef } from "react";
import { config } from "@/lib/config";

interface AdBannerProps {
  /** ID do bloco de anúncio (data-ad-slot). */
  slot: string;
  /** Formato do anúncio (data-ad-format). Padrão: "auto". */
  format?: string;
  /** Responsivo em largura total (data-full-width-responsive). Padrão: true. */
  fullWidthResponsive?: boolean;
  /** Classes utilitárias extras (ex.: espaçamento). */
  className?: string;
}

// Tipagem mínima do array global que o loader do AdSense injeta.
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Bloco de anúncio do Google AdSense (unidade `<ins class="adsbygoogle">`).
 *
 * O script loader (adsbygoogle.js) já é carregado uma única vez no <head>
 * pelo componente <AdSense/>. Aqui apenas renderizamos a unidade e a
 * registramos via `adsbygoogle.push({})` após a montagem.
 *
 * O `pushed` (ref) evita empurrar duas vezes — o que ocorreria no
 * double-invoke do StrictMode (dev) e em re-renders, gerando o erro
 * "already have ads in them" do AdSense.
 */
export function AdBanner({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  className,
}: AdBannerProps) {
  const client = config.analytics.adsenseClient;
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Bloqueadores de anúncio ou loader ausente — falha silenciosa.
    }
  }, [client]);

  // Sem client configurado, não renderiza nada (evita <ins> órfã).
  if (!client) return null;

  return (
    <ins
      className={`adsbygoogle block${className ? ` ${className}` : ""}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
    />
  );
}

import type { Metadata } from "next";
import { config } from "./config";

/**
 * Helpers de SEO — centralizam a construção de metadados e das tags
 * <link rel="canonical">, que no Next.js são geradas via `alternates.canonical`.
 *
 * REGRA DE CANONICALIZAÇÃO do projeto:
 *  - Rotas "alias" (ex.: /city, /travel/[slug], /linhas) renderizam o mesmo
 *    conteúdo da rota principal, porém o canonical SEMPRE aponta para a rota
 *    principal, evitando conteúdo duplicado nos motores de busca.
 */

interface BuildMetadataParams {
  title: string;
  description?: string;
  /** Caminho canônico (ex.: "/cidades"). Sempre a ROTA PRINCIPAL. */
  canonicalPath: string;
  /** Se a página não deve ser indexada (ex.: erros). */
  noindex?: boolean;
  images?: string[];
}

/** Monta uma URL absoluta a partir de um caminho relativo. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${config.site.url}${clean}`;
}

export function buildMetadata({
  title,
  description = config.site.description,
  canonicalPath,
  noindex = false,
  images,
}: BuildMetadataParams): Metadata {
  const fullTitle =
    title === config.site.name ? title : `${title} | ${config.site.name}`;
  const url = absoluteUrl(canonicalPath);

  return {
    title: fullTitle,
    description,
    alternates: {
      // Gera <link rel="canonical" href="..." /> apontando para a rota principal.
      canonical: url,
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: config.site.name,
      locale: "pt_BR",
      type: "website",
      images: images?.map((src) => ({ url: src })),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images,
    },
  };
}

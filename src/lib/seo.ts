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
  /** Se a página não deve ser indexada (ex.: erros, páginas de tempo real). */
  noindex?: boolean;
  images?: string[];
}

/** Imagem padrão para Open Graph / Twitter quando a página não define uma. */
const DEFAULT_OG_IMAGE = "/logo-horariodeonibusdf.png";

/** Monta uma URL absoluta a partir de um caminho relativo. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${config.site.url}${clean}`;
}

/**
 * Título de exibição de uma linha, evitando a redundância comum na API onde o
 * `nome` já começa com o número (ex.: número "0.111" + nome "0.111 Rodoviária…"
 * viraria "Linha 0.111 — 0.111 Rodoviária…"). Remove o número duplicado.
 */
export function tituloLinha(numero: string | undefined, nome: string): string {
  let n = (nome ?? "").trim();
  if (numero) {
    const esc = numero.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    n = n.replace(new RegExp(`^${esc}\\s*[-–—:/]?\\s*`), "").trim();
  }
  if (numero && n) return `Linha ${numero} — ${n}`;
  if (numero) return `Linha ${numero}`;
  return n || "Linha";
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
  const ogImages = (images && images.length > 0 ? images : [DEFAULT_OG_IMAGE]).map(
    (src) => (src.startsWith("http") ? src : absoluteUrl(src)),
  );

  return {
    // `absolute` evita que o template de título do layout (`%s | ...`) seja
    // reaplicado, o que duplicaria o nome do site no <title>.
    title: { absolute: fullTitle },
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
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ogImages,
    },
  };
}

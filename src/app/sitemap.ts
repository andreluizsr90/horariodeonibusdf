import type { MetadataRoute } from "next";
import { config } from "@/lib/config";
import { absoluteUrl } from "@/lib/seo";
import { busService } from "@/application/services/bus-service";

// Revalida o sitemap periodicamente (dados dinâmicos de linhas/cidades).
export const revalidate = 3600;

/**
 * Sitemap dinâmico. Inclui SOMENTE as rotas principais/canônicas — as aliases
 * são deliberadamente omitidas para não duplicar conteúdo no índice.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: config.site.url, lastModified: now, priority: 1 },
    { url: absoluteUrl("/cidades"), lastModified: now, priority: 0.8 },
    { url: absoluteUrl("/linhas"), lastModified: now, priority: 0.8 },
    { url: absoluteUrl("/tarifas"), lastModified: now, priority: 0.5 },
    {
      url: absoluteUrl("/tarifas/distrito-federal"),
      lastModified: now,
      priority: 0.4,
    },
    {
      url: absoluteUrl("/tarifas/cidades-entorno"),
      lastModified: now,
      priority: 0.4,
    },
    {
      url: absoluteUrl("/achados-e-perdidos"),
      lastModified: now,
      priority: 0.4,
    },
  ];

  // Rotas dinâmicas — falham graciosamente se a API estiver indisponível.
  try {
    const [cidades, linhas] = await Promise.all([
      busService.getCidades(),
      busService.getLinhas(),
    ]);

    for (const cidade of cidades) {
      staticRoutes.push({
        url: absoluteUrl(`/cidades/${cidade.slug}`),
        lastModified: now,
        priority: 0.6,
      });
    }

    for (const linha of linhas) {
      staticRoutes.push({
        url: absoluteUrl(`/linhas/${linha.slug}`),
        lastModified: now,
        priority: 0.7,
      });
    }
  } catch {
    // Mantém apenas as rotas estáticas.
  }

  return staticRoutes;
}

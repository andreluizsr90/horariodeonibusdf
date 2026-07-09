import type { MetadataRoute } from "next";
import { config } from "@/lib/config";
import { absoluteUrl } from "@/lib/seo";
import { busService } from "@/application/services/bus-service";

// Dinâmico por requisição — ver nota em src/app/page.tsx. No build (sem
// credenciais da API) o sitemap sairia sem as URLs de linhas/cidades; gerá-lo
// em runtime garante o índice completo.
export const dynamic = "force-dynamic";

/**
 * Sitemap dinâmico. Inclui SOMENTE as rotas principais/canônicas — as aliases
 * são deliberadamente omitidas para não duplicar conteúdo no índice.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // NÃO incluímos "/linhas": seu canonical aponta para "/" (a home é a página
  // raiz de linhas), então listá-la aqui seria uma URL não-canônica.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: config.site.url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/cidades"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/tarifas"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/tarifas/distrito-federal"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/tarifas/cidades-entorno"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/achados-e-perdidos"),
      lastModified: now,
      changeFrequency: "yearly",
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
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    for (const linha of linhas) {
      staticRoutes.push({
        url: absoluteUrl(`/linhas/${linha.slug}`),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Mantém apenas as rotas estáticas.
  }

  return staticRoutes;
}

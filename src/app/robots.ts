import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rotas alias existem apenas para compatibilidade; não precisam ser
      // rastreadas, pois o canonical já consolida o conteúdo nas principais.
      disallow: ["/pages/", "/city", "/travel/"],
    },
    sitemap: `${config.site.url}/sitemap.xml`,
    host: config.site.url,
  };
}

import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rotas alias existem apenas para compatibilidade; não precisam ser
      // rastreadas, pois o canonical já consolida o conteúdo nas principais.
      // "/linha/" (singular) é alias; não conflita com "/linhas/" (o caractere
      // seguinte a "linha" é "s", não "/").
      disallow: ["/pages/", "/city", "/travel/", "/linha/"],
    },
    sitemap: `${config.site.url}/sitemap.xml`,
    host: config.site.url,
  };
}

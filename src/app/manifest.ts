import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

/**
 * Web App Manifest (PWA). Torna o site instalável como aplicativo no
 * celular e no desktop. O Next.js serve isto em /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${config.site.name} — Horários, Linhas e Itinerários`,
    short_name: config.site.shortName,
    description: config.site.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1d63f1",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["travel", "navigation", "utilities"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

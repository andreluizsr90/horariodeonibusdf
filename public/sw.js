/*
 * Service Worker — habilita a instalação como PWA e um cache básico offline.
 *
 * Estratégias:
 *  - Navegações (páginas): network-first com fallback ao cache e, por fim, à
 *    home ("/"), para funcionar mesmo offline.
 *  - Assets estáticos (_next/static, imagens, fontes): cache-first.
 * Requisições não-GET e de outras origens (ex.: API externa, Analytics,
 * AdSense) passam direto, sem interceptação.
 */

const CACHE = "honibusdf-v1";
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // allSettled: um recurso ausente não invalida toda a instalação.
      await Promise.allSettled(PRECACHE.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Páginas → network-first (conteúdo sempre fresco quando online).
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, res.clone());
          return res;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match("/")) || Response.error();
        }
      })(),
    );
    return;
  }

  // Assets estáticos → cache-first.
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    /\.(?:png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        const cache = await caches.open(CACHE);
        cache.put(request, res.clone());
        return res;
      })(),
    );
  }
});

/* Service Worker — instalação como PWA + cache offline básico.
 * Páginas: network-first (conteúdo sempre fresco) com fallback ao cache.
 * Assets estáticos: cache-first. */
const CACHE = "honibusdf-v2";
const PRECACHE = ["/", "/assets/css/app.css", "/assets/js/site.js", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(PRECACHE.map((u) => c.add(u)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // API/GPS/anúncios passam direto

  if (request.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(request);
        (await caches.open(CACHE)).put(request, res.clone());
        return res;
      } catch {
        return (await caches.match(request)) || (await caches.match("/")) || Response.error();
      }
    })());
    return;
  }

  if (/\.(?:css|js|png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)) {
    // stale-while-revalidate: responde rápido do cache, mas SEMPRE revalida em
    // segundo plano — assim uma nova versão do CSS/JS chega no próximo load
    // (as URLs também levam ?v=mtime, o que já invalida o cache na publicação).
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(request);
      const rede = fetch(request).then((res) => { cache.put(request, res.clone()); return res; }).catch(() => null);
      return hit || (await rede) || Response.error();
    })());
  }
});

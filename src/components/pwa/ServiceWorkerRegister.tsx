"use client";

import { useEffect } from "react";

/**
 * Registra o Service Worker (/sw.js) para habilitar a instalação como PWA
 * e o cache offline. Registra apenas em produção — em desenvolvimento o SW
 * atrapalharia o hot-reload do Next.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Falha no registro não deve quebrar a aplicação.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}

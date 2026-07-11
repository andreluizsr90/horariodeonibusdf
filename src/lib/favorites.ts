"use client";

import { useSyncExternalStore } from "react";

/**
 * Favoritos de linhas — persistência 100% client-side (sem login).
 *
 * Guarda um array de slugs de linhas no localStorage (ex.: ["0.005", "110"]).
 * O slug é o mesmo identificador usado nas URLs (/linhas/{slug}), então serve
 * como ID estável e legível.
 *
 * A leitura reativa usa `useSyncExternalStore`, garantindo:
 *  - SSR seguro (snapshot de servidor = lista vazia, sem mismatch de hidratação);
 *  - sincronização entre todos os componentes que usam o hook;
 *  - sincronização entre abas via evento `storage`.
 */

const STORAGE_KEY = "honibusdf:favoritos";
const EVENT = "honibusdf:favoritos-change";

/** Referência estável exigida pelo useSyncExternalStore quando nada mudou. */
let cache: string[] = [];
const SERVER_SNAPSHOT: string[] = [];

function lerDoStorage(): string[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

// Inicializa o cache no carregamento do módulo (apenas no cliente).
if (typeof window !== "undefined") {
  cache = lerDoStorage();
}

/** Recalcula o cache a partir do storage, preservando a referência se igual. */
function sincronizarCache(): string[] {
  const atual = lerDoStorage();
  const igual =
    atual.length === cache.length && atual.every((v, i) => v === cache[i]);
  if (!igual) cache = atual;
  return cache;
}

function persistir(lista: string[]): void {
  cache = lista;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // Storage indisponível (modo privado/cheio) — ignora silenciosamente.
  }
  // Notifica os assinantes desta aba (o evento `storage` só dispara nas outras).
  window.dispatchEvent(new Event(EVENT));
}

/** Adiciona ou remove um slug dos favoritos. */
export function alternarFavorito(slug: string): void {
  const atual = lerDoStorage();
  const proximo = atual.includes(slug)
    ? atual.filter((s) => s !== slug)
    : [...atual, slug];
  persistir(proximo);
}

/** Remove um slug dos favoritos. */
export function removerFavorito(slug: string): void {
  persistir(lerDoStorage().filter((s) => s !== slug));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback); // sincroniza entre abas
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Lista reativa de slugs favoritados. Vazia no servidor e na 1ª hidratação. */
export function useFavoritos(): string[] {
  return useSyncExternalStore(
    subscribe,
    sincronizarCache,
    () => SERVER_SNAPSHOT,
  );
}

/** Indica reativamente se um slug está favoritado. */
export function useEhFavorito(slug: string): boolean {
  return useFavoritos().includes(slug);
}

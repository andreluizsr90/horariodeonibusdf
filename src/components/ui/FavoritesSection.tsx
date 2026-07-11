"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Linha } from "@/core/domain/entities";
import { useFavoritos } from "@/lib/favorites";
import { FavoriteToggle } from "./FavoriteToggle";

/**
 * Bloco "Minhas Linhas Favoritas" exibido no TOPO da home quando há favoritos.
 *
 * É client-side: no servidor (e na 1ª hidratação) a lista de favoritos é vazia,
 * então nada é renderizado — o fluxo padrão da home permanece intacto. Após a
 * hidratação, se houver favoritos salvos, a seção aparece dinamicamente. Ao
 * remover o último favorito, a seção some (a lista reativa fica vazia).
 *
 * Recebe todas as linhas (já carregadas pela home) e resolve cada favorito por
 * slug — sem novas requisições. Botões condicionais por linha:
 *  - "Ver Horários" sempre;
 *  - "Ver Localização" apenas para linhas da Semob (têm GPS em tempo real).
 */
export function FavoritesSection({ linhas }: { linhas: Linha[] }) {
  const favoritos = useFavoritos();

  const porSlug = useMemo(() => {
    const mapa = new Map<string, Linha>();
    for (const l of linhas) mapa.set(l.slug, l);
    return mapa;
  }, [linhas]);

  // Preserva a ordem em que foram favoritadas; descarta slugs desconhecidos.
  const favoritas = useMemo(
    () =>
      favoritos
        .map((slug) => porSlug.get(slug))
        .filter((l): l is Linha => Boolean(l)),
    [favoritos, porSlug],
  );

  if (favoritas.length === 0) return null;

  return (
    <section
      aria-labelledby="favoritos-titulo"
      className="mb-8 rounded-2xl border border-accent-400/40 bg-accent-500/5 p-5 sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-accent-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
        </svg>
        <h2
          id="favoritos-titulo"
          className="text-lg font-bold text-slate-900"
        >
          Minhas Linhas Favoritas
        </h2>
        <span className="rounded-full bg-accent-500/20 px-2.5 py-0.5 text-xs font-semibold text-accent-600">
          {favoritas.length}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {favoritas.map((linha) => (
          <li
            key={linha.slug}
            className="relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3 pr-9">
              <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                {linha.numero || "—"}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-slate-800">
                  {linha.nome}
                </span>
                {(linha.origem || linha.destino) && (
                  <span className="mt-0.5 block truncate text-sm text-slate-500">
                    {[linha.origem, linha.destino].filter(Boolean).join(" → ")}
                  </span>
                )}
              </span>
            </div>

            {/* Estrela (preenchida) para remover o favorito com um clique. */}
            <FavoriteToggle
              slug={linha.slug}
              numero={linha.numero}
              className="absolute right-2 top-2"
            />

            {/* Ações condicionais. */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/linhas/${linha.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Ver Horários
              </Link>

              {linha.semob && (
                <Link
                  href={`/linhas/${linha.slug}/localizacao`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  <span
                    className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500"
                    aria-hidden="true"
                  />
                  Ver Localização
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

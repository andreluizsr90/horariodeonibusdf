"use client";

import { useMemo, useState } from "react";
import type { TarifaEntorno } from "@/lib/tarifas-data";

/**
 * Explorador de tarifas do Entorno (GO ↔ DF).
 *
 * Como a tabela é grande (dezenas de trajetos), oferecemos busca por
 * localidade de origem ou destino (ignorando acentos/maiúsculas) e uma
 * lista responsiva: em telas largas, origem → destino e preço na mesma
 * linha; no mobile, empilhados. Evita a rolagem horizontal de uma tabela.
 */

/** Normaliza texto para busca: minúsculas e sem acentos. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[^\w\s]/g, "") // remove acentos (marcas de combinação) e símbolos
    .toLowerCase();
}

const CONECTIVOS = /\b(de|do|da|dos|das|e)\b/gi;

/** Converte "AGUAS LINDAS DE GOIAS" em "Aguas Lindas de Goias". */
function titulo(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/(^|[\s/(])([a-zà-ú])/g, (_, sep, ch) => sep + ch.toUpperCase())
    .replace(CONECTIVOS, (m) => m.toLowerCase());
}

function UfBadge({ uf }: { uf: string }) {
  const isDf = uf.toUpperCase() === "DF";
  return (
    <span
      className={`inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded px-1 text-xs font-bold ${
        isDf ? "bg-brand-100 text-brand-800" : "bg-accent-500/20 text-accent-600"
      }`}
    >
      {uf}
    </span>
  );
}

export function TarifasEntornoExplorer({
  tarifas,
}: {
  tarifas: TarifaEntorno[];
}) {
  const [query, setQuery] = useState("");
  const termo = normalizar(query.trim());

  const resultados = useMemo(() => {
    if (!termo) return tarifas;
    return tarifas.filter(
      (t) =>
        normalizar(t.origem).includes(termo) ||
        normalizar(t.destino).includes(termo),
    );
  }, [tarifas, termo]);

  return (
    <div>
      {/* Busca */}
      <div className="relative mb-4">
        <label htmlFor="busca-tarifa" className="sr-only">
          Buscar tarifa por origem ou destino
        </label>
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <input
          id="busca-tarifa"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cidade de origem ou destino…"
          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          aria-describedby="tarifa-status"
        />
      </div>

      <p id="tarifa-status" className="mb-4 text-sm text-slate-500" aria-live="polite">
        {termo
          ? `${resultados.length} resultado${resultados.length === 1 ? "" : "s"} para “${query}”`
          : `${tarifas.length} trajetos disponíveis`}
      </p>

      {resultados.length > 0 ? (
        <ul className="space-y-2">
          {resultados.map((t, i) => (
            <li
              key={`${t.origem}-${t.destino}-${t.valor}-${i}`}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <UfBadge uf={t.ufOrigem} />
                <span className="font-medium text-slate-800">
                  {titulo(t.origem)}
                </span>
                <svg
                  className="h-4 w-4 shrink-0 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a.75.75 0 01.75-.75h9.19L9.72 6.03a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z"
                    clipRule="evenodd"
                  />
                </svg>
                <UfBadge uf={t.ufDestino} />
                <span className="font-medium text-slate-800">
                  {titulo(t.destino)}
                </span>
                {t.marcador && (
                  <span className="inline-flex items-center rounded-full bg-accent-500/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent-600">
                    {t.marcador}
                  </span>
                )}
              </div>
              <span className="shrink-0 self-start rounded-lg bg-brand-600 px-3 py-1.5 text-base font-bold tabular-nums text-white sm:self-auto">
                {t.valor}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Nenhum trajeto encontrado para “{query}”.
        </div>
      )}
    </div>
  );
}

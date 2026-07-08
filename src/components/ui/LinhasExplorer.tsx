"use client";

import { useMemo, useState } from "react";
import type { Linha } from "@/core/domain/entities";
import { LinhaCard } from "./LinhaCard";

interface LinhasExplorerProps {
  /** Conjunto completo de linhas para busca. */
  linhas: Linha[];
  /**
   * Quantas linhas exibir quando NÃO há busca ativa (a home mostra 50).
   * Se omitido, mostra todas.
   */
  limiteInicial?: number;
  placeholder?: string;
}

/**
 * Componente client de exploração de linhas: barra de busca (por nome ou
 * número) que filtra a lista completa em tempo real. Sem busca ativa,
 * exibe apenas `limiteInicial` linhas.
 */
export function LinhasExplorer({
  linhas,
  limiteInicial,
  placeholder = "Buscar por nome ou número da linha…",
}: LinhasExplorerProps) {
  const [query, setQuery] = useState("");

  const termo = query.trim().toLowerCase();

  const resultados = useMemo(() => {
    if (!termo) {
      return limiteInicial ? linhas.slice(0, limiteInicial) : linhas;
    }
    return linhas.filter(
      (l) =>
        l.nome.toLowerCase().includes(termo) ||
        l.numero.toLowerCase().includes(termo) ||
        l.origem?.toLowerCase().includes(termo) ||
        l.destino?.toLowerCase().includes(termo),
    );
  }, [linhas, termo, limiteInicial]);

  return (
    <div>
      {/* Barra de pesquisa */}
      <div className="relative mb-6">
        <label htmlFor="busca-linha" className="sr-only">
          Buscar linha de ônibus
        </label>
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <input
          id="busca-linha"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          aria-describedby="busca-status"
        />
      </div>

      <p id="busca-status" className="mb-4 text-sm text-slate-500" aria-live="polite">
        {termo
          ? `${resultados.length} resultado${resultados.length === 1 ? "" : "s"} para “${query}”`
          : limiteInicial
            ? `Exibindo ${resultados.length} de ${linhas.length} linhas`
            : `${linhas.length} linhas disponíveis`}
      </p>

      {resultados.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resultados.map((linha) => (
            <li key={linha.id}>
              <LinhaCard linha={linha} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Nenhuma linha encontrada para “{query}”.
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { SentidoLinha } from "@/core/domain/entities";

/**
 * Conteúdo interativo da página de detalhes da linha.
 *
 * UX:
 *  - Abas por SENTIDO (Ida / Volta) — só aparecem quando há mais de um.
 *  - Horários com seletor de TIPO DE DIA (Dias úteis / Sábado / Domingo),
 *    exibidos como uma grade compacta de "chips".
 *  - Itinerário em timeline, COLAPSADO por padrão (origem → destino visíveis)
 *    e rolável quando expandido, para não dominar a página.
 * Totalmente responsivo (mobile-first) e acessível (tablist, aria-*).
 */

const ITINERARIO_LIMITE = 6;

export function LinhaDetalheContent({
  sentidos,
}: {
  sentidos: SentidoLinha[];
}) {
  const [sIdx, setSIdx] = useState(0);
  const [itinerarioAberto, setItinerarioAberto] = useState(false);

  if (sentidos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Ainda não há horários ou itinerário disponíveis para esta linha.
      </div>
    );
  }

  const sentido = sentidos[Math.min(sIdx, sentidos.length - 1)];
  const dias = sentido.horarios;

  function selecionarSentido(i: number) {
    setSIdx(i);
    setItinerarioAberto(false);
  }

  const itinerario = sentido.itinerario;
  const precisaColapsar = itinerario.length > ITINERARIO_LIMITE;
  const mostrarTudo = itinerarioAberto || !precisaColapsar;

  return (
    <div className="space-y-6">
      {/* Abas de sentido */}
      {sentidos.length > 1 && (
        <div
          role="tablist"
          aria-label="Sentido da linha"
          className="inline-flex w-full max-w-md rounded-xl bg-slate-100 p-1 sm:w-auto"
        >
          {sentidos.map((s, i) => {
            const ativo = i === sIdx;
            return (
              <button
                key={s.nome}
                role="tab"
                type="button"
                aria-selected={ativo}
                onClick={() => selecionarSentido(i)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  ativo
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.nome}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* -------------------- Horários -------------------- */}
        <section
          aria-labelledby="horarios-titulo"
          className="lg:col-span-3"
        >
          <h2
            id="horarios-titulo"
            className="mb-4 text-lg font-semibold text-slate-900"
          >
            Horários de saída
          </h2>

          {dias.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              Horários não disponíveis para o sentido{" "}
              <strong>{sentido.nome}</strong>.
            </p>
          ) : (
            /* Blocos por tipo de dia, empilhados e sempre visíveis. */
            <div className="space-y-4">
              {dias.map((dia) => (
                <div
                  key={dia.dia}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-brand-700">{dia.dia}</h3>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                      {dia.saidas.length} horário
                      {dia.saidas.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {dia.saidas.map((saida, i) => (
                      <li
                        key={`${saida}-${i}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-sm font-semibold tabular-nums text-slate-700"
                      >
                        {saida}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* -------------------- Itinerário -------------------- */}
        <section
          aria-labelledby="itinerario-titulo"
          className="lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2
              id="itinerario-titulo"
              className="text-lg font-semibold text-slate-900"
            >
              Itinerário
            </h2>
            {itinerario.length > 0 && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {itinerario.length} ponto{itinerario.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {itinerario.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              Itinerário não disponível para o sentido{" "}
              <strong>{sentido.nome}</strong>.
            </p>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div
                className={
                  mostrarTudo && precisaColapsar
                    ? "max-h-[26rem] overflow-y-auto pr-1"
                    : ""
                }
              >
                <ol className="relative space-y-4 border-l-2 border-brand-100 pl-6">
                  {mostrarTudo ? (
                    itinerario.map((ponto, i) => (
                      <PontoItem
                        key={`${ponto}-${i}`}
                        ponto={ponto}
                        origem={i === 0}
                        destino={i === itinerario.length - 1}
                      />
                    ))
                  ) : (
                    <>
                      {itinerario
                        .slice(0, ITINERARIO_LIMITE - 1)
                        .map((ponto, i) => (
                          <PontoItem
                            key={`${ponto}-${i}`}
                            ponto={ponto}
                            origem={i === 0}
                          />
                        ))}
                      <li className="relative">
                        <span
                          className="absolute -left-[1.72rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-300"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-slate-400">
                          + {itinerario.length - ITINERARIO_LIMITE} paradas
                          intermediárias
                        </span>
                      </li>
                      <PontoItem
                        ponto={itinerario[itinerario.length - 1]}
                        destino
                      />
                    </>
                  )}
                </ol>
              </div>

              {precisaColapsar && (
                <button
                  type="button"
                  onClick={() => setItinerarioAberto((v) => !v)}
                  aria-expanded={itinerarioAberto}
                  className="mt-4 w-full rounded-lg border border-brand-200 bg-brand-50 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  {itinerarioAberto
                    ? "Recolher itinerário"
                    : `Ver todos os ${itinerario.length} pontos`}
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** Um ponto do itinerário na timeline, com destaque para origem e destino. */
function PontoItem({
  ponto,
  origem,
  destino,
}: {
  ponto: string;
  origem?: boolean;
  destino?: boolean;
}) {
  const cor = origem
    ? "bg-emerald-500"
    : destino
      ? "bg-brand-600"
      : "bg-brand-300";

  return (
    <li className="relative">
      <span
        className={`absolute -left-[1.72rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${cor}`}
        aria-hidden="true"
      />
      {(origem || destino) && (
        <span
          className={`mb-0.5 block text-xs font-semibold uppercase tracking-wide ${
            origem ? "text-emerald-600" : "text-brand-700"
          }`}
        >
          {origem ? "Origem" : "Destino"}
        </span>
      )}
      <span
        className={`block text-sm ${
          origem || destino
            ? "font-semibold text-slate-800"
            : "text-slate-600"
        }`}
      >
        {ponto}
      </span>
    </li>
  );
}

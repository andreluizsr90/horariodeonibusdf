"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  LayerGroup,
  Map as LeafletMap,
} from "leaflet";
import type { Coordenada, Percurso } from "@/core/domain/entities";
// A folha de estilos do Leaflet é um import de efeito colateral (só CSS),
// seguro no servidor — ao contrário do JS da biblioteca, que referencia
// `window` e por isso é carregado dinamicamente dentro do useEffect.
import "leaflet/dist/leaflet.css";

/**
 * Mapa do trajeto geográfico da linha (Leaflet + OpenStreetMap).
 *
 * Renderiza o percurso de um sentido por vez (Ida/Volta) como uma L.polyline,
 * com marcadores vetoriais de origem/destino, e permite alternar o sentido.
 *
 * Notas de arquitetura:
 *  - É um Client Component: o Leaflet manipula o DOM imperativamente e depende
 *    de `window`. Por isso o pacote é importado via `import("leaflet")` dentro
 *    do efeito (nunca no topo), evitando quebrar o SSR do App Router.
 *  - Descarte de recursos: no cleanup do efeito chamamos `map.remove()`,
 *    liberando a instância ao trocar de rota (/linhas/[slug]) ou na remontagem
 *    do React StrictMode — prevenindo vazamento de memória.
 *  - Ao alternar Ida/Volta, a camada anterior é removida antes de desenhar a
 *    nova e o mapa é reenquadrado com `fitBounds`.
 */

interface SentidoConfig {
  chave: keyof Percurso;
  nome: string;
  /** Cor da polyline e do marcador de destino. */
  cor: string;
}

const SENTIDOS: SentidoConfig[] = [
  { chave: "ida", nome: "Trajeto de Ida", cor: "#1d63f1" }, // brand-600
  { chave: "volta", nome: "Trajeto de Volta", cor: "#dc2626" }, // red-600
];

const COR_ORIGEM = "#059669"; // emerald-600

interface TrajetoDisponivel extends SentidoConfig {
  coordenadas: Coordenada[];
}

export function MapaTrajeto({ percurso }: { percurso: Percurso }) {
  // Trajetos desenháveis (>= 2 pontos), memoizados a partir do percurso.
  // Estável entre renders → evita reinicializar o mapa e redesenhos supérfluos.
  const disponiveis = useMemo<TrajetoDisponivel[]>(
    () =>
      SENTIDOS.map((s) => ({
        ...s,
        coordenadas: percurso[s.chave] ?? [],
      })).filter((s) => s.coordenadas.length >= 2),
    [percurso],
  );

  const [idx, setIdx] = useState(0);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  // Se o percurso mudar (navegação client-side para outra linha), volta ao
  // primeiro sentido para não deixar o índice apontando para algo inexistente.
  useEffect(() => {
    setIdx(0);
  }, [disponiveis]);

  // ---- Inicialização / descarte do mapa ----------------------------------
  useEffect(() => {
    if (disponiveis.length === 0) return;
    let cancelado = false;

    import("leaflet")
      .then((L) => {
        // O efeito pode ter sido limpo antes do import resolver (StrictMode).
        if (cancelado || !containerRef.current || mapRef.current) return;

        leafletRef.current = L;
        const map = L.map(containerRef.current, {
          // Não "sequestra" o scroll da página; o zoom por scroll exige foco.
          scrollWheelZoom: false,
        });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; colaboradores do <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        mapRef.current = map;
        setPronto(true);
      })
      .catch(() => {
        if (!cancelado) setErro(true);
      });

    return () => {
      cancelado = true;
      layerRef.current = null;
      // Descarte completo: remove listeners e nós do DOM da instância Leaflet.
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setPronto(false);
    };
  }, [disponiveis]);

  // ---- Desenho do sentido selecionado ------------------------------------
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!pronto || !L || !map) return;

    const atual = disponiveis[Math.min(idx, disponiveis.length - 1)];
    if (!atual) return;

    // 1) Limpeza: remove o trajeto anterior antes de desenhar o novo.
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    // 2) Desenha o novo trajeto agrupado com seus marcadores.
    const grupo = L.layerGroup();
    const linha = L.polyline(atual.coordenadas, {
      color: atual.cor,
      weight: 5,
      opacity: 0.9,
      lineJoin: "round",
      lineCap: "round",
    }).addTo(grupo);

    // Marcadores vetoriais (circleMarker) — sem depender de assets de ícone,
    // evitando os 404 clássicos do marker-icon.png em bundlers.
    const inicio = atual.coordenadas[0];
    const fim = atual.coordenadas[atual.coordenadas.length - 1];
    L.circleMarker(inicio, {
      radius: 7,
      color: "#ffffff",
      weight: 2,
      fillColor: COR_ORIGEM,
      fillOpacity: 1,
    })
      .bindPopup("Origem")
      .addTo(grupo);
    L.circleMarker(fim, {
      radius: 7,
      color: "#ffffff",
      weight: 2,
      fillColor: atual.cor,
      fillOpacity: 1,
    })
      .bindPopup("Destino")
      .addTo(grupo);

    grupo.addTo(map);
    layerRef.current = grupo;

    // 3) Enquadramento automático no trajeto selecionado.
    map.fitBounds(linha.getBounds(), { padding: [28, 28] });
  }, [pronto, idx, disponiveis]);

  if (disponiveis.length === 0) return null;

  return (
    <section aria-labelledby="mapa-titulo" className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2
          id="mapa-titulo"
          className="text-lg font-semibold text-slate-900"
        >
          Mapa do trajeto
        </h2>

        {/* Alternador de sentido (só quando há Ida e Volta). */}
        {disponiveis.length > 1 && (
          <div
            role="tablist"
            aria-label="Sentido do trajeto"
            className="inline-flex rounded-xl bg-slate-100 p-1"
          >
            {disponiveis.map((s, i) => {
              const ativo = i === idx;
              return (
                <button
                  key={s.chave}
                  role="tab"
                  type="button"
                  aria-selected={ativo}
                  onClick={() => setIdx(i)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
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
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {erro ? (
          <div className="flex h-[380px] items-center justify-center p-6 text-center text-sm text-slate-500 sm:h-[460px]">
            Não foi possível carregar o mapa do trajeto no momento.
          </div>
        ) : (
          // `isolate` cria um contexto de empilhamento próprio, mantendo os
          // controles do Leaflet abaixo do cabeçalho fixo (sticky, z-50).
          <div
            ref={containerRef}
            role="application"
            aria-label={`Mapa do ${disponiveis[Math.min(idx, disponiveis.length - 1)].nome.toLowerCase()}`}
            className="isolate h-[380px] w-full sm:h-[460px]"
          />
        )}
      </div>

      {/* Legenda simples de origem/destino. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: COR_ORIGEM }}
            aria-hidden="true"
          />
          Origem
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor:
                disponiveis[Math.min(idx, disponiveis.length - 1)].cor,
            }}
            aria-hidden="true"
          />
          Destino
        </span>
      </div>
    </section>
  );
}

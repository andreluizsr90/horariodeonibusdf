"use client";

import { useEffect, useRef, useState } from "react";
import type { DivIcon, Map as LeafletMap, Marker } from "leaflet";
import type { Percurso, VeiculoLinha } from "@/core/domain/entities";
import "leaflet/dist/leaflet.css";

/**
 * Mapa de LOCALIZAÇÃO EM TEMPO REAL dos ônibus de uma linha.
 *
 * Otimizações (requisito):
 *  - As rotas (ida/volta) são ESTÁTICAS: desenhadas UMA única vez na
 *    inicialização e nunca redesenhadas nos ciclos seguintes.
 *  - A cada ciclo, SOMENTE as posições dos marcadores são atualizadas
 *    (reaproveitando as instâncias de Marker via setLatLng).
 *
 * Ciclo (polling de 10s): contador chega a 0 → GET /api/gps/linha/{numero}
 *  → atualiza/insere/remove marcadores → contador reinicia em 10.
 *
 * Leaflet é importado dinamicamente (usa `window`); o mapa é descartado
 * (map.remove()) e os timers limpos no unmount, evitando memory leaks.
 */

const COR_IDA = "#1d63f1"; // brand-600
const COR_VOLTA = "#dc2626"; // red-600
const INTERVALO = 10; // segundos
const BRASILIA: [number, number] = [-15.7934, -47.8822];

type Status = "carregando" | "ok" | "vazio" | "erro";

interface Resposta {
  veiculos?: VeiculoLinha[];
  erro?: boolean;
  atualizadoEm?: number;
  mock?: boolean;
}

const COR_NEUTRO = "#64748b"; // slate-500 (sem rota para classificar o veículo)

type Sentido = "ida" | "volta" | "neutro";

// Ícone de ônibus (divIcon vetorial — sem depender de assets de imagem).
const BUS_PATH =
  "M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z";

function criarIconeOnibus(L: typeof import("leaflet"), cor: string): DivIcon {
  return L.divIcon({
    className: "onibus-pin",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    html: `<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:${cor};border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45)">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="${BUS_PATH}"/></svg>
    </span>`,
  });
}

// --- Geometria: em qual rota (ida/volta) o veículo está "por cima"? --------
// Projeção equirectangular local (metros aprox.), suficiente para COMPARAR a
// proximidade do veículo às duas polylines na escala de Brasília.
const LAT0 = -15.8;
const R_TERRA = 6_371_000;

function projetar(lat: number, lng: number): [number, number] {
  const rad = Math.PI / 180;
  return [lng * rad * Math.cos(LAT0 * rad) * R_TERRA, lat * rad * R_TERRA];
}

function distPontoSegmento(
  p: [number, number],
  a: [number, number],
  b: [number, number],
): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function distAteRota(p: [number, number], rota: [number, number][]): number {
  if (rota.length === 0) return Infinity;
  if (rota.length === 1) return Math.hypot(p[0] - rota[0][0], p[1] - rota[0][1]);
  let min = Infinity;
  for (let i = 0; i < rota.length - 1; i++) {
    min = Math.min(min, distPontoSegmento(p, rota[i], rota[i + 1]));
  }
  return min;
}

export function MapaLocalizacao({
  numero,
  percurso,
}: {
  numero: string;
  percurso?: Percurso;
}) {
  const [pronto, setPronto] = useState(false);
  const [erroMapa, setErroMapa] = useState(false);
  const [segundos, setSegundos] = useState(INTERVALO);
  const [status, setStatus] = useState<Status>("carregando");
  const [total, setTotal] = useState(0);
  const [atualizadoEm, setAtualizadoEm] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const iconeIdaRef = useRef<DivIcon | null>(null);
  const iconeVoltaRef = useRef<DivIcon | null>(null);
  const iconeNeutroRef = useRef<DivIcon | null>(null);
  const idaProjRef = useRef<[number, number][]>([]);
  const voltaProjRef = useRef<[number, number][]>([]);
  const marcadoresRef = useRef<Map<string, Marker>>(new Map());
  const sentidosRef = useRef<Map<string, Sentido>>(new Map());
  const vivoRef = useRef(false);

  // ---- Inicialização: mapa + rotas (uma única vez) -----------------------
  useEffect(() => {
    let cancelado = false;

    import("leaflet")
      .then((L) => {
        if (cancelado || !containerRef.current || mapRef.current) return;

        leafletRef.current = L;
        iconeIdaRef.current = criarIconeOnibus(L, COR_IDA);
        iconeVoltaRef.current = criarIconeOnibus(L, COR_VOLTA);
        iconeNeutroRef.current = criarIconeOnibus(L, COR_NEUTRO);

        const map = L.map(containerRef.current, { scrollWheelZoom: false });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; colaboradores do <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Rotas ESTÁTICAS — desenhadas só aqui, nunca nos updates de posição.
        const camadas: import("leaflet").Polyline[] = [];
        if ((percurso?.ida?.length ?? 0) >= 2) {
          camadas.push(
            L.polyline(percurso!.ida, { color: COR_IDA, weight: 4, opacity: 0.85 }).addTo(map),
          );
        }
        if ((percurso?.volta?.length ?? 0) >= 2) {
          camadas.push(
            L.polyline(percurso!.volta, { color: COR_VOLTA, weight: 4, opacity: 0.85 }).addTo(map),
          );
        }

        // Pré-projeta as rotas UMA vez (são estáticas) para classificar os
        // veículos por proximidade a cada ciclo sem reprojetar as polylines.
        idaProjRef.current =
          (percurso?.ida?.length ?? 0) >= 2
            ? percurso!.ida.map(([la, ln]) => projetar(la, ln))
            : [];
        voltaProjRef.current =
          (percurso?.volta?.length ?? 0) >= 2
            ? percurso!.volta.map(([la, ln]) => projetar(la, ln))
            : [];

        if (camadas.length > 0) {
          map.fitBounds(L.featureGroup(camadas).getBounds(), { padding: [28, 28] });
        } else {
          map.setView(BRASILIA, 11);
        }

        mapRef.current = map;
        setPronto(true);
      })
      .catch(() => {
        if (!cancelado) setErroMapa(true);
      });

    return () => {
      cancelado = true;
      marcadoresRef.current.clear();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setPronto(false);
    };
  }, [percurso]);

  // ---- Polling + contador regressivo -------------------------------------
  useEffect(() => {
    if (!pronto || !numero) return;
    vivoRef.current = true;

    async function buscar() {
      try {
        const res = await fetch(`/api/gps/linha/${encodeURIComponent(numero)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as Resposta;
        if (!vivoRef.current) return;

        const veiculos = data.veiculos ?? [];
        atualizarMarcadores(veiculos);
        setTotal(veiculos.length);
        setAtualizadoEm(data.atualizadoEm ?? null);
        setStatus(data.erro ? "erro" : veiculos.length > 0 ? "ok" : "vazio");
      } catch {
        if (vivoRef.current) setStatus("erro");
      }
    }

    let sec = INTERVALO;
    setSegundos(sec);
    buscar(); // primeira carga imediata

    const id = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        buscar();
        sec = INTERVALO;
      }
      setSegundos(sec);
    }, 1000);

    return () => {
      vivoRef.current = false;
      clearInterval(id);
    };
  }, [pronto, numero]);

  /** Sentido (ida/volta) segundo a rota mais próxima do veículo; neutro se não há rota. */
  function sentidoDoVeiculo(v: VeiculoLinha): Sentido {
    const temIda = idaProjRef.current.length >= 2;
    const temVolta = voltaProjRef.current.length >= 2;
    if (!temIda && !temVolta) return "neutro";
    if (temIda && !temVolta) return "ida";
    if (temVolta && !temIda) return "volta";
    const p = projetar(v.lat, v.lng);
    return distAteRota(p, idaProjRef.current) <= distAteRota(p, voltaProjRef.current)
      ? "ida"
      : "volta";
  }

  function iconePara(sentido: Sentido): DivIcon | null {
    if (sentido === "volta") return iconeVoltaRef.current;
    if (sentido === "neutro") return iconeNeutroRef.current;
    return iconeIdaRef.current;
  }

  /** Reaproveita marcadores existentes; adiciona novos; remove os que sumiram. */
  function atualizarMarcadores(veiculos: VeiculoLinha[]) {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const vistos = new Set<string>();
    for (const v of veiculos) {
      vistos.add(v.id);
      const sentido = sentidoDoVeiculo(v);
      const icon = iconePara(sentido);
      const atual = marcadoresRef.current.get(v.id);
      if (atual) {
        atual.setLatLng([v.lat, v.lng]); // só move o pino
        // Recolore APENAS quando o veículo troca de rota (ida <-> volta).
        if (icon && sentidosRef.current.get(v.id) !== sentido) {
          atual.setIcon(icon);
        }
        atual.setPopupContent(popupHtml(v, sentido));
      } else if (icon) {
        const m = L.marker([v.lat, v.lng], { icon }).addTo(map);
        m.bindPopup(popupHtml(v, sentido));
        marcadoresRef.current.set(v.id, m);
      }
      sentidosRef.current.set(v.id, sentido);
    }

    for (const [id, m] of marcadoresRef.current) {
      if (!vistos.has(id)) {
        map.removeLayer(m);
        marcadoresRef.current.delete(id);
        sentidosRef.current.delete(id);
      }
    }
  }

  const idaOk = (percurso?.ida?.length ?? 0) >= 2;
  const voltaOk = (percurso?.volta?.length ?? 0) >= 2;

  return (
    <section aria-labelledby="loc-titulo">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="loc-titulo" className="text-lg font-semibold text-slate-900">
          Ônibus em tempo real
        </h2>
        <StatusBadge status={status} total={total} atualizadoEm={atualizadoEm} />
      </div>

      <div className="relative isolate overflow-hidden rounded-xl border border-slate-200 bg-white">
        {erroMapa ? (
          <div className="flex h-[420px] items-center justify-center p-6 text-center text-sm text-slate-500 sm:h-[520px]">
            Não foi possível carregar o mapa no momento.
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              role="application"
              aria-label={`Mapa de localização em tempo real da linha ${numero}`}
              className="h-[420px] w-full sm:h-[520px]"
            />
            {/* Contador regressivo sobre o mapa. */}
            <div className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2">
              <div className="rounded-full bg-slate-900/85 px-4 py-1.5 text-sm font-semibold text-white shadow-lg backdrop-blur">
                Atualizando em: {segundos}s
              </div>
              <div className="mx-auto mt-1 h-1 w-40 overflow-hidden rounded-full bg-white/40">
                <div
                  className="h-full rounded-full bg-brand-400 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(segundos / INTERVALO) * 100}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Legenda das rotas estáticas + do pino. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
        {idaOk && <Legenda cor={COR_IDA} label="Rota de ida" />}
        {voltaOk && <Legenda cor={COR_VOLTA} label="Rota de volta" />}
        {idaOk && <PinoLegenda cor={COR_IDA} label="Ônibus na ida" />}
        {voltaOk && <PinoLegenda cor={COR_VOLTA} label="Ônibus na volta" />}
        {!idaOk && !voltaOk && (
          <PinoLegenda cor={COR_NEUTRO} label="Ônibus (posição atual)" />
        )}
        {!idaOk && !voltaOk && (
          <span>Traçado da rota indisponível para esta linha.</span>
        )}
      </div>
    </section>
  );
}

function popupHtml(v: VeiculoLinha, sentido: Sentido): string {
  const vel = v.velocidade != null ? `${Math.round(v.velocidade)} km/h` : "—";
  const rotulo =
    sentido === "ida"
      ? "Sentido: ida"
      : sentido === "volta"
        ? "Sentido: volta"
        : "Sentido: indefinido";
  return `<div style="font-size:12px;line-height:1.5">
    <strong>Ônibus ${v.id}</strong><br/>${rotulo}<br/>Velocidade: ${vel}
  </div>`;
}

function Legenda({ cor, label }: { cor: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block h-1 w-5 rounded-full"
        style={{ backgroundColor: cor }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

/** Legenda com o pino de ônibus na cor do sentido. */
function PinoLegenda({ cor, label }: { cor: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full"
        style={{ backgroundColor: cor }}
        aria-hidden="true"
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff">
          <path d={BUS_PATH} />
        </svg>
      </span>
      {label}
    </span>
  );
}

function StatusBadge({
  status,
  total,
  atualizadoEm,
}: {
  status: Status;
  total: number;
  atualizadoEm: number | null;
}) {
  const hora = atualizadoEm
    ? new Date(atualizadoEm).toLocaleTimeString("pt-BR")
    : null;

  if (status === "erro") {
    return (
      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        Sem dados de GPS no momento
      </span>
    );
  }
  if (status === "carregando") {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
        Carregando posições…
      </span>
    );
  }
  if (status === "vazio") {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        Nenhum ônibus em operação agora
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      {total} ônibus em operação{hora ? ` · ${hora}` : ""}
    </span>
  );
}

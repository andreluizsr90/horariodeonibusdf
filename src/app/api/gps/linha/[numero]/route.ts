import { type NextRequest, NextResponse } from "next/server";
import type { VeiculoLinha } from "@/core/domain/entities";

/**
 * Proxy do feed de GPS em tempo real do DFTrans.
 *
 * Por que um proxy (e não fetch direto do browser)?
 *  - A origem (sistemas.dftrans.df.gov.br) é GEOBLOQUEADA para fora do Brasil e
 *    não envia cabeçalhos CORS — um fetch client-side seria bloqueado.
 *  - Aqui, server-side, buscamos o FeatureCollection (GeoJSON), fazemos a
 *    tradução para o domínio (inclui a inversão [lng,lat] → [lat,lng]) e
 *    devolvemos um payload mínimo e estável para o cliente.
 *
 * Sempre dinâmico e sem cache — é um dado de tempo real.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const UPSTREAM = (numero: string) =>
  `https://www.sistemas.dftrans.df.gov.br/gps/linha/${encodeURIComponent(
    numero,
  )}/geo/recent`;

// Aborta a chamada de upstream se ela demorar mais que o ciclo de polling.
const TIMEOUT_MS = 8000;

interface RawFeature {
  geometry?: { coordinates?: [number, number]; type?: string };
  properties?: {
    numero?: string | number;
    velocidade?: string | number;
    horario?: number;
    linha?: string;
  };
}
interface RawFeatureCollection {
  features?: RawFeature[];
}

/** Traduz o GeoJSON do DFTrans para VeiculoLinha[], invertendo [lng,lat]. */
function normalizar(fc: RawFeatureCollection): VeiculoLinha[] {
  const out: VeiculoLinha[] = [];
  for (const f of fc.features ?? []) {
    const coords = f.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;

    // GeoJSON: [longitude, latitude]. Leaflet espera [latitude, longitude].
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

    const p = f.properties ?? {};
    const vel = p.velocidade != null ? Number(p.velocidade) : NaN;
    out.push({
      id: p.numero != null ? String(p.numero) : `${lat.toFixed(5)},${lng.toFixed(5)}`,
      lat,
      lng,
      velocidade: Number.isFinite(vel) ? vel : undefined,
      horario: typeof p.horario === "number" ? p.horario : undefined,
    });
  }
  return out;
}

/**
 * Dados fictícios para desenvolvimento (a origem é geobloqueada). As posições
 * oscilam no tempo para validar que SÓ os marcadores se movem entre ciclos.
 * NUNCA ativo em produção.
 */
function mockVeiculos(): VeiculoLinha[] {
  const t = Date.now() / 1000;
  const wob = (n: number) => Math.sin(t / 4 + n) * 0.012;
  const now = Date.now();
  return [
    { id: "MOCK-337978", lat: -15.7935 + wob(1), lng: -47.8823 + wob(2), velocidade: 34, horario: now },
    { id: "MOCK-337980", lat: -15.8267 + wob(3), lng: -47.9218 + wob(4), velocidade: 0, horario: now },
    { id: "MOCK-337991", lat: -15.9335 + wob(5), lng: -48.0405 + wob(6), velocidade: 47, horario: now },
  ];
}

const noStore = { "Cache-Control": "no-store" } as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ numero: string }> },
) {
  const { numero } = await params;

  // Mock só em desenvolvimento, e só quando pedido explicitamente (?mock=1).
  if (
    process.env.NODE_ENV !== "production" &&
    req.nextUrl.searchParams.get("mock") === "1"
  ) {
    return NextResponse.json(
      { veiculos: mockVeiculos(), atualizadoEm: Date.now(), mock: true },
      { headers: noStore },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(UPSTREAM(numero), {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; honibusdf/1.0)",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const fc = (await res.json()) as RawFeatureCollection;
    return NextResponse.json(
      { veiculos: normalizar(fc), atualizadoEm: Date.now() },
      { headers: noStore },
    );
  } catch {
    // Falha graciosa: o cliente mantém o ciclo de polling e mostra o aviso.
    return NextResponse.json(
      { veiculos: [], erro: true, atualizadoEm: Date.now() },
      { headers: noStore },
    );
  } finally {
    clearTimeout(timer);
  }
}

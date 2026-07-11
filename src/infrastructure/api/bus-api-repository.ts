import "server-only";

import type { BusRepository } from "@/core/ports/bus-repository";
import type {
  Cidade,
  Coordenada,
  Horario,
  Linha,
  LinhaDetalhe,
  Percurso,
  SentidoLinha,
} from "@/core/domain/entities";
import { slugify } from "@/lib/slug";
import { apiGet } from "./http-client";

/**
 * Implementação concreta do BusRepository consumindo a API HTTP externa.
 *
 * Faz o "anti-corruption layer": recebe o payload bruto (DTO) e o traduz
 * para as entidades de domínio, sendo tolerante a pequenas variações de
 * nomes de campos (numero/number, nome/name, etc.).
 */

// ---- DTOs esperados (parciais e tolerantes) --------------------------------

interface RawCidade {
  id?: string | number;
  nome?: string;
  name?: string;
  slug?: string;
  uf?: string;
  estado?: string;
  total_linhas?: number;
  totalLinhas?: number;
}

interface RawLinha {
  id?: string | number;
  _id?: string;
  estado?: string;
  numero?: string | number;
  number?: string | number;
  codigo?: string | number;
  nome?: string;
  name?: string;
  slug?: string;
  origem?: string;
  destino?: string;
  cidade_slug?: string;
  cidadeSlug?: string;
  cidade?: string;
  cidade_nome?: string;
  operadora?: string;
  empresa?: string;
}

interface RawHorario {
  dia?: string;
  categoria?: string;
  /** Categoria do dia na API real: "util" | "sabado" | "domingo". */
  tipo_dia?: string;
  /** "ida" | "volta". */
  sentido?: string;
  saidas?: string[];
  horarios?: string[];
}

/**
 * Uma coordenada crua pode chegar como tupla [lat, lng] ou como objeto com
 * chaves variadas (lat/lng, lat/lon, latitude/longitude, y/x).
 */
type RawCoordenada =
  | [number | string, number | string]
  | {
      lat?: number | string;
      latitude?: number | string;
      y?: number | string;
      lng?: number | string;
      lon?: number | string;
      long?: number | string;
      longitude?: number | string;
      x?: number | string;
    };

/** Objeto de percurso por sentido, ex.: { ida: [...], volta: [...] }. */
interface RawPercurso {
  ida?: RawCoordenada[];
  volta?: RawCoordenada[];
}

interface RawLinhaDetalhe extends RawLinha {
  itinerario?: string[];
  paradas?: string[];
  /** Formato real: objeto por sentido, ex.: { ida: [...], volta: [...] }. */
  itinerarios?: Record<string, string[]> | string[];
  horarios?: RawHorario[] | string[];
  tarifa?: string | number;
  informacoes_adicionais?: string;
  informacoesAdicionais?: string;
  distancia?: string;
  duracao?: string;
  /** Trajeto geográfico por sentido (coordenadas). */
  percurso?: RawPercurso;
  /** Aliases tolerados para o mesmo dado. */
  trajeto?: RawPercurso;
  rota?: RawPercurso;
  /** Bloco de dados da Semob/DFTrans; presente só nas linhas desse sistema. */
  semob_extra?: unknown;
}

// Rótulos amigáveis para as categorias de dia e sentido da API.
const LABEL_TIPO_DIA: Record<string, string> = {
  util: "Dias úteis",
  uteis: "Dias úteis",
  sabado: "Sábado",
  domingo: "Domingo e feriados",
  feriado: "Feriados",
};

const LABEL_SENTIDO: Record<string, string> = {
  ida: "Ida",
  volta: "Volta",
};

function labelDia(raw?: string): string {
  if (!raw) return "Horários";
  return LABEL_TIPO_DIA[raw.toLowerCase()] ?? raw;
}

function labelSentido(raw?: string): string | undefined {
  if (!raw) return undefined;
  return LABEL_SENTIDO[raw.toLowerCase()] ?? raw;
}

// Muitas APIs encapsulam a coleção em { data: [...] }.
type Envelope<T> = T[] | { data?: T[]; items?: T[] };

function unwrap<T>(payload: Envelope<T>): T[] {
  if (Array.isArray(payload)) return payload;
  return payload?.data ?? payload?.items ?? [];
}

function str(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

/**
 * Heurística de Semob a partir do slug (usada na LISTAGEM, que não traz o bloco
 * `semob_extra`). As linhas interestaduais do Entorno têm slug prefixado com
 * "ANTT-"; todas as demais (DFTrans) são Semob. No DETALHE, o valor é confirmado
 * pela presença de `semob_extra` (ver mapLinhaDetalhe), que tem prioridade.
 */
function ehSemobSlug(slug: string): boolean {
  return !/^antt[-_]/i.test(slug);
}

// ---- Mapeadores ------------------------------------------------------------

function mapCidade(raw: RawCidade): Cidade {
  const nome = str(raw.nome ?? raw.name, "Cidade");
  return {
    id: str(raw.id ?? raw.slug ?? slugify(nome)),
    nome,
    // Preserva o slug fornecido pela API; só gera um quando ausente.
    slug: raw.slug ? String(raw.slug).trim() : slugify(nome),
    uf: raw.uf ?? raw.estado,
    totalLinhas: raw.totalLinhas ?? raw.total_linhas,
  };
}

function mapLinha(raw: RawLinha): Linha {
  const numero = str(raw.numero ?? raw.number ?? raw.codigo);
  const nome = str(raw.nome ?? raw.name, numero || "Linha");
  // Se a API já fornece o slug (ex.: "0.005"), preservamos exatamente como
  // está — ele é a chave usada no endpoint /api/onibus/linhas/{slug}.
  // Só geramos um slug (via slugify) quando a API não informa nenhum.
  const slug = raw.slug
    ? String(raw.slug).trim()
    : slugify(`${numero} ${nome}`.trim());
  return {
    id: str(raw.id ?? raw._id ?? slug),
    numero,
    nome,
    slug,
    origem: raw.origem,
    destino: raw.destino,
    cidadeSlug: raw.cidadeSlug ?? raw.cidade_slug,
    cidadeNome: raw.cidade_nome ?? raw.cidade ?? raw.estado,
    operadora: raw.operadora ?? raw.empresa,
    semob: ehSemobSlug(slug),
  };
}

function mapHorario(raw: RawHorario | string): Horario {
  if (typeof raw === "string") {
    return { dia: "Horários", saidas: [raw] };
  }
  return {
    dia: raw.dia ?? raw.categoria ?? labelDia(raw.tipo_dia),
    saidas: raw.saidas ?? raw.horarios ?? [],
  };
}

/** Chave de sentido de um bloco de horário (ida/volta), quando houver. */
function sentidoKey(raw: RawHorario | string): string {
  if (typeof raw === "string") return "";
  return (raw.sentido ?? "").toLowerCase();
}

/**
 * Constrói os sentidos da linha combinando `itinerarios` (objeto por sentido)
 * e `horarios` (lista com `sentido`/`tipo_dia`). Mantém apenas os sentidos que
 * têm itinerário OU horários, e ordena Ida antes de Volta.
 */
function mapSentidos(raw: RawLinhaDetalhe): SentidoLinha[] {
  const itinerariosObj =
    raw.itinerarios && !Array.isArray(raw.itinerarios)
      ? raw.itinerarios
      : undefined;
  const horariosRaw = Array.isArray(raw.horarios) ? raw.horarios : [];

  // Coleta as chaves de sentido presentes (itinerários + horários).
  const chaves = new Set<string>();
  if (itinerariosObj) {
    for (const k of Object.keys(itinerariosObj)) chaves.add(k.toLowerCase());
  }
  for (const h of horariosRaw) {
    const k = sentidoKey(h);
    if (k) chaves.add(k);
  }

  // Caminho de fallback: dados "planos" (sem estrutura por sentido).
  if (chaves.size === 0) {
    const itinerario = Array.isArray(raw.itinerario)
      ? raw.itinerario
      : Array.isArray(raw.paradas)
        ? raw.paradas
        : [];
    const horarios = horariosRaw
      .map(mapHorario)
      .filter((h) => h.saidas.length > 0);
    if (itinerario.length === 0 && horarios.length === 0) return [];
    return [{ nome: "Linha", itinerario, horarios }];
  }

  const ordem = (k: string) => (k === "ida" ? 0 : k === "volta" ? 1 : 2);
  const ordenadas = [...chaves].sort((a, b) => ordem(a) - ordem(b));

  const sentidos: SentidoLinha[] = [];
  for (const chave of ordenadas) {
    const itinerario =
      itinerariosObj && Array.isArray(itinerariosObj[chave])
        ? itinerariosObj[chave]
        : [];
    const horarios = horariosRaw
      .filter((h) => sentidoKey(h) === chave)
      .map(mapHorario)
      .filter((h) => h.saidas.length > 0);

    // Ignora sentidos totalmente vazios (ex.: "volta" sem pontos nem horários).
    if (itinerario.length === 0 && horarios.length === 0) continue;

    sentidos.push({
      nome: labelSentido(chave) ?? chave,
      itinerario,
      horarios,
    });
  }
  return sentidos;
}

/**
 * Normaliza uma coordenada crua para o formato [lat, lng] do domínio.
 * Retorna null quando os valores não são numéricos ou estão fora dos
 * intervalos geográficos válidos (lat ∈ [-90, 90], lng ∈ [-180, 180]).
 */
function toCoordenada(raw: RawCoordenada): Coordenada | null {
  let lat: unknown;
  let lng: unknown;

  if (Array.isArray(raw)) {
    [lat, lng] = raw;
  } else if (raw && typeof raw === "object") {
    lat = raw.lat ?? raw.latitude ?? raw.y;
    lng = raw.lng ?? raw.lon ?? raw.long ?? raw.longitude ?? raw.x;
  } else {
    return null;
  }

  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
  if (la < -90 || la > 90 || ln < -180 || ln > 180) return null;
  return [la, ln];
}

/** Converte uma lista crua em coordenadas válidas, descartando as inválidas. */
function toCoordenadas(raw: RawCoordenada[] | undefined): Coordenada[] {
  if (!Array.isArray(raw)) return [];
  const out: Coordenada[] = [];
  for (const item of raw) {
    const c = toCoordenada(item);
    if (c) out.push(c);
  }
  return out;
}

/**
 * Traduz o campo `percurso` (ou aliases) em um Percurso de domínio.
 * Retorna undefined quando não há coordenadas válidas em nenhum sentido,
 * para que a UI não exiba um mapa vazio.
 */
function mapPercurso(raw: RawLinhaDetalhe): Percurso | undefined {
  const src = raw.percurso ?? raw.trajeto ?? raw.rota;
  if (!src || typeof src !== "object" || Array.isArray(src)) return undefined;

  const ida = toCoordenadas(src.ida);
  const volta = toCoordenadas(src.volta);
  if (ida.length === 0 && volta.length === 0) return undefined;

  return { ida, volta };
}

function mapLinhaDetalhe(raw: RawLinhaDetalhe): LinhaDetalhe {
  const base = mapLinha(raw);
  return {
    ...base,
    sentidos: mapSentidos(raw),
    tarifa:
      raw.tarifa !== undefined && raw.tarifa !== null
        ? str(raw.tarifa)
        : undefined,
    informacoesAdicionais:
      raw.informacoesAdicionais ?? raw.informacoes_adicionais,
    distancia: raw.distancia,
    duracao: raw.duracao,
    percurso: mapPercurso(raw),
    // Só as linhas da Semob/DFTrans trazem o bloco `semob_extra` (objeto) —
    // é o que habilita o rastreamento por GPS em tempo real.
    semob: typeof raw.semob_extra === "object" && raw.semob_extra !== null,
  };
}

// ---- Repositório -----------------------------------------------------------

export class BusApiRepository implements BusRepository {
  async getCidades(): Promise<Cidade[]> {
    const payload = await apiGet<Envelope<RawCidade>>("/api/onibus/cidades", {
      revalidateSeconds: 3600, // cidades mudam raramente
    });
    return unwrap(payload)
      .map(mapCidade)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  async getLinhas(cidadeSlug?: string): Promise<Linha[]> {
    const payload = await apiGet<Envelope<RawLinha>>("/api/onibus/linhas", {
      revalidateSeconds: 900,
      searchParams: cidadeSlug ? { cidade: cidadeSlug } : undefined,
    });
    let linhas = unwrap(payload).map(mapLinha);

    // Fallback: se a API não filtrar por cidade no servidor, filtramos aqui.
    if (cidadeSlug) {
      const filtered = linhas.filter((l) => l.cidadeSlug === cidadeSlug);
      if (filtered.length > 0) linhas = filtered;
    }

    return linhas.sort((a, b) =>
      a.numero.localeCompare(b.numero, "pt-BR", { numeric: true }),
    );
  }

  async getLinhaBySlug(slug: string): Promise<LinhaDetalhe | null> {
    try {
      const payload = await apiGet<
        RawLinhaDetalhe | { data?: RawLinhaDetalhe }
      >(`/api/onibus/linhas/${encodeURIComponent(slug)}`, {
        revalidateSeconds: 900,
      });
      const raw =
        payload && "data" in payload && payload.data
          ? payload.data
          : (payload as RawLinhaDetalhe);
      if (!raw || Object.keys(raw).length === 0) return null;
      return mapLinhaDetalhe(raw);
    } catch (error) {
      // Erros 404 chegam aqui como exceção do http-client.
      if (error instanceof Error && /HTTP 404/.test(error.message)) {
        return null;
      }
      throw error;
    }
  }
}

/** Instância singleton pronta para uso pela camada de aplicação. */
export const busRepository: BusRepository = new BusApiRepository();

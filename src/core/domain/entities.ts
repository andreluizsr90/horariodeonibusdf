/**
 * Camada de Domínio — Entidades.
 *
 * Modelos puros da regra de negócio, independentes de framework, HTTP ou
 * do formato exato retornado pela API externa. A tradução entre o payload
 * bruto da API (DTO) e estas entidades acontece na camada de infraestrutura.
 */

export interface Cidade {
  id: string;
  nome: string;
  slug: string;
  /** Unidade federativa (ex.: "DF", "GO"). */
  uf?: string;
  /** Quantidade de linhas disponíveis, quando informada pela API. */
  totalLinhas?: number;
}

export interface Linha {
  id: string;
  /** Número/identificador visível da linha (ex.: "0.111"). */
  numero: string;
  nome: string;
  slug: string;
  origem?: string;
  destino?: string;
  cidadeSlug?: string;
  cidadeNome?: string;
  /** Operadora/empresa responsável, quando disponível. */
  operadora?: string;
}

export interface Horario {
  /** Categoria do dia (ex.: "Dias úteis", "Sábado", "Domingo e feriados"). */
  dia: string;
  /** Lista de horários de partida no formato "HH:mm". */
  saidas: string[];
}

/** Coordenada geográfica no formato aceito pelo Leaflet: [latitude, longitude]. */
export type Coordenada = [number, number];

/**
 * Trajeto geográfico da linha, separado por sentido. Cada sentido é uma
 * sequência ordenada de coordenadas usada para desenhar o percurso no mapa
 * (L.polyline). Modelar por sentido espelha o restante do domínio (SentidoLinha)
 * e permite alternar Ida/Volta na UI.
 */
export interface Percurso {
  /** Coordenadas do sentido de ida (origem → destino). */
  ida: Coordenada[];
  /** Coordenadas do sentido de volta (destino → origem). */
  volta: Coordenada[];
}

/**
 * Um sentido da linha (ex.: "Ida" ou "Volta"), com seu próprio itinerário
 * e sua própria tabela de horários por tipo de dia. Modelar por sentido é o
 * que permite uma UI clara: o usuário escolhe a direção e vê só o que importa.
 */
export interface SentidoLinha {
  /** Nome do sentido (ex.: "Ida", "Volta"). */
  nome: string;
  /** Sequência de pontos/paradas do itinerário deste sentido. */
  itinerario: string[];
  /** Horários deste sentido, agrupados por tipo de dia. */
  horarios: Horario[];
}

export interface LinhaDetalhe extends Linha {
  /** Sentidos da linha (apenas os que possuem itinerário ou horários). */
  sentidos: SentidoLinha[];
  /** Valor da tarifa formatado (ex.: "R$ 5,50"). */
  tarifa?: string;
  informacoesAdicionais?: string;
  /** Distância aproximada do trajeto (ex.: "23 km"). */
  distancia?: string;
  /** Duração média da viagem (ex.: "1h20"). */
  duracao?: string;
  /**
   * Trajeto geográfico (ida/volta) para renderização no mapa. Presente apenas
   * quando a API fornece o campo `percurso` com coordenadas válidas.
   */
  percurso?: Percurso;
}

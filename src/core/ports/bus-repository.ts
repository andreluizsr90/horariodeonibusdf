/**
 * Camada de Domínio — Porta (interface) do repositório de ônibus.
 *
 * Define o CONTRATO que a camada de aplicação consome, sem conhecer a
 * implementação concreta (HTTP, mock, cache, etc.). Isso é a inversão de
 * dependência da Clean Architecture: o domínio define a interface, a
 * infraestrutura a implementa.
 */

import type { Cidade, Linha, LinhaDetalhe } from "@/core/domain/entities";

export interface BusRepository {
  /** Lista todas as cidades disponíveis. */
  getCidades(): Promise<Cidade[]>;

  /** Lista todas as linhas disponíveis (opcionalmente de uma cidade). */
  getLinhas(cidadeSlug?: string): Promise<Linha[]>;

  /** Retorna os detalhes de uma linha pelo slug, ou null se não existir. */
  getLinhaBySlug(slug: string): Promise<LinhaDetalhe | null>;
}

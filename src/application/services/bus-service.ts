import "server-only";

import type {
  Cidade,
  Linha,
  LinhaDetalhe,
} from "@/core/domain/entities";
import type { BusRepository } from "@/core/ports/bus-repository";
import { busRepository } from "@/infrastructure/api/bus-api-repository";

/**
 * Camada de Aplicação — Serviço de Ônibus (casos de uso).
 *
 * Orquestra as regras de negócio consumindo a PORTA (BusRepository), sem
 * conhecer a implementação concreta. Recebe o repositório por injeção de
 * dependência (padrão default = implementação HTTP), o que facilita testes.
 */
export class BusService {
  constructor(private readonly repo: BusRepository = busRepository) {}

  /** Lista todas as cidades ordenadas por nome. */
  getCidades(): Promise<Cidade[]> {
    return this.repo.getCidades();
  }

  /** Busca uma cidade específica pelo slug. */
  async getCidadeBySlug(slug: string): Promise<Cidade | null> {
    const cidades = await this.repo.getCidades();
    return cidades.find((c) => c.slug === slug) ?? null;
  }

  /** Lista todas as linhas (opcionalmente filtradas por cidade). */
  getLinhas(cidadeSlug?: string): Promise<Linha[]> {
    return this.repo.getLinhas(cidadeSlug);
  }

  /**
   * Retorna N linhas aleatórias para a home. Usa embaralhamento
   * Fisher-Yates para uma distribuição uniforme.
   */
  async getLinhasAleatorias(quantidade = 50): Promise<Linha[]> {
    const linhas = [...(await this.repo.getLinhas())];
    for (let i = linhas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [linhas[i], linhas[j]] = [linhas[j], linhas[i]];
    }
    return linhas.slice(0, quantidade);
  }

  /** Detalhes de uma linha pelo slug. */
  getLinhaDetalhe(slug: string): Promise<LinhaDetalhe | null> {
    return this.repo.getLinhaBySlug(slug);
  }
}

/** Instância pronta para uso nos Server Components. */
export const busService = new BusService();

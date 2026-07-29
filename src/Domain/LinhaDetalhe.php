<?php

declare(strict_types=1);

namespace App\Domain;

/**
 * Detalhe completo de uma linha: sentidos (itinerário + horários), trajeto
 * geográfico e informações adicionais.
 */
final class LinhaDetalhe extends Linha
{
    /** @param list<Sentido> $sentidos */
    public function __construct(
        string $id,
        string $numero,
        string $nome,
        string $slug,
        ?string $origem,
        ?string $destino,
        ?string $cidadeSlug,
        ?string $cidadeNome,
        ?string $operadora,
        bool $semob,
        public readonly array $sentidos = [],
        public readonly ?Percurso $percurso = null,
        public readonly ?string $tarifa = null,
        public readonly ?string $informacoesAdicionais = null,
    ) {
        parent::__construct(
            $id, $numero, $nome, $slug,
            $origem, $destino, $cidadeSlug, $cidadeNome, $operadora, $semob,
        );
    }

    public function totalSaidas(): int
    {
        return array_sum(array_map(static fn (Sentido $s): int => $s->totalSaidas(), $this->sentidos));
    }

    public function totalPontos(): int
    {
        $totais = array_map(static fn (Sentido $s): int => $s->totalPontos(), $this->sentidos);

        return $totais === [] ? 0 : max($totais);
    }

    public function temMapa(): bool
    {
        return $this->percurso instanceof Percurso && !$this->percurso->vazio();
    }
}

<?php

declare(strict_types=1);

namespace App\Domain;

final readonly class Cidade
{
    public function __construct(
        public string $id,
        public string $nome,
        public string $slug,
        public ?string $uf = null,
        public ?int $totalLinhas = null,
    ) {
    }

    /** Texto auxiliar do card: contagem de linhas (quando houver) + UF. */
    public function descricao(): string
    {
        $partes = [];

        $partes[] = $this->totalLinhas !== null
            ? $this->totalLinhas . ' linha' . ($this->totalLinhas === 1 ? '' : 's')
            : 'Ver linhas disponíveis';

        if ($this->uf !== null && $this->uf !== '') {
            $partes[] = $this->uf;
        }

        return implode(' · ', $partes);
    }
}

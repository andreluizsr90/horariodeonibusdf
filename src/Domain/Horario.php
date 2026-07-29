<?php

declare(strict_types=1);

namespace App\Domain;

/**
 * Horários de um tipo de dia (ex.: "Dias úteis") dentro de um sentido.
 */
final readonly class Horario
{
    /** @param list<string> $saidas Horários "HH:mm". */
    public function __construct(
        public string $dia,
        public array $saidas,
    ) {
    }

    public function total(): int
    {
        return count($this->saidas);
    }
}

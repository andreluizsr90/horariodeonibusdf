<?php

declare(strict_types=1);

namespace App\Domain;

/**
 * Um sentido da linha (Ida/Volta), com itinerário e horários próprios.
 * Modelar por sentido é o que permite a UI clara de abas/blocos.
 */
final readonly class Sentido
{
    /**
     * @param list<string>  $itinerario Pontos/paradas em ordem.
     * @param list<Horario> $horarios   Horários agrupados por tipo de dia.
     */
    public function __construct(
        public string $nome,
        public array $itinerario,
        public array $horarios,
    ) {
    }

    public function totalSaidas(): int
    {
        return array_sum(array_map(static fn (Horario $h): int => $h->total(), $this->horarios));
    }

    public function totalPontos(): int
    {
        return count($this->itinerario);
    }

    public function vazio(): bool
    {
        return $this->itinerario === [] && $this->horarios === [];
    }
}

<?php

declare(strict_types=1);

namespace App\Domain;

/**
 * Trajeto geográfico da linha, por sentido.
 * Coordenadas no formato do Leaflet: [latitude, longitude].
 */
final readonly class Percurso
{
    /**
     * @param list<array{float,float}> $ida
     * @param list<array{float,float}> $volta
     */
    public function __construct(
        public array $ida,
        public array $volta,
    ) {
    }

    public function vazio(): bool
    {
        return $this->ida === [] && $this->volta === [];
    }

    /** @return array{ida: list<array{float,float}>, volta: list<array{float,float}>} */
    public function toArray(): array
    {
        return ['ida' => $this->ida, 'volta' => $this->volta];
    }
}

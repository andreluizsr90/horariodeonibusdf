<?php

declare(strict_types=1);

namespace App\View;

/**
 * Metadados de SEO da página.
 *
 * `canonical` é SEMPRE o caminho da rota PRINCIPAL — as rotas alias passam o
 * mesmo valor da principal, que é o que consolida o conteúdo duplicado.
 */
final readonly class Meta
{
    public function __construct(
        public string $title,
        public string $canonical,
        public ?string $description = null,
        public bool $noindex = false,
    ) {
    }
}

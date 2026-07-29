<?php

declare(strict_types=1);

namespace App\Support;

use Normalizer;

final class Slug
{
    /**
     * Gera um slug URL-safe. Não depende de `iconv` — a extensão não existe
     * em algumas imagens PHP (ex.: trafex/php-nginx).
     */
    public static function from(string $texto): string
    {
        $texto = mb_strtolower($texto, 'UTF-8');

        if (class_exists(Normalizer::class)) {
            // NFD separa a letra da marca diacrítica; removemos as marcas.
            $texto = Normalizer::normalize($texto, Normalizer::FORM_D) ?: $texto;
            $texto = (string) preg_replace('/\p{Mn}+/u', '', $texto);
        } else {
            $texto = strtr($texto, [
                'á' => 'a', 'à' => 'a', 'ã' => 'a', 'â' => 'a', 'ä' => 'a',
                'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
                'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
                'ó' => 'o', 'ò' => 'o', 'õ' => 'o', 'ô' => 'o', 'ö' => 'o',
                'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u',
                'ç' => 'c', 'ñ' => 'n',
            ]);
        }

        return trim((string) preg_replace('/[^a-z0-9]+/', '-', $texto), '-');
    }

    /** "AGUAS LINDAS DE GOIAS" → "Aguas Lindas de Goias". */
    public static function titulo(string $texto): string
    {
        $titulo = mb_convert_case(mb_strtolower($texto, 'UTF-8'), MB_CASE_TITLE, 'UTF-8');

        return (string) preg_replace_callback(
            '/\b(De|Do|Da|Dos|Das|E)\b/u',
            static fn (array $m): string => mb_strtolower($m[1], 'UTF-8'),
            $titulo,
        );
    }
}

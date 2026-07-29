<?php

declare(strict_types=1);

namespace App\Http;

use RuntimeException;

/** Recurso não encontrado — vira uma página 404 amigável. */
final class NotFoundException extends RuntimeException
{
}

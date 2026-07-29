<?php

declare(strict_types=1);

namespace App\Api;

use RuntimeException;

/**
 * A API externa está fora, sem credenciais ou respondeu erro.
 * Os controllers capturam isso para degradar a página com um aviso amigável,
 * em vez de estourar erro 500.
 */
final class ApiIndisponivelException extends RuntimeException
{
}

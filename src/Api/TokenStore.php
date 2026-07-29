<?php

declare(strict_types=1);

namespace App\Api;

/**
 * Cache do token de autenticação em arquivo, compartilhado entre requisições
 * PHP (cada request é um processo novo — cache em memória não sobreviveria).
 *
 * Guarda { token, expires } e sabe dizer se está perto de expirar, conforme a
 * janela de antecedência (skew) configurada.
 */
final class TokenStore
{
    public function __construct(
        private readonly string $arquivo,
        private readonly int $skewSegundos,
    ) {
    }

    /** @return array{token: string, expires: int}|null */
    public function ler(): ?array
    {
        if (!is_file($this->arquivo)) {
            return null;
        }

        $dados = json_decode((string) @file_get_contents($this->arquivo), true);

        if (!is_array($dados) || !isset($dados['token'], $dados['expires'])) {
            return null;
        }

        return ['token' => (string) $dados['token'], 'expires' => (int) $dados['expires']];
    }

    public function gravar(string $token, int $expiraEm): void
    {
        $dir = dirname($this->arquivo);

        if (!is_dir($dir)) {
            @mkdir($dir, 0775, true);
        }

        // LOCK_EX evita escrita parcial sob concorrência.
        @file_put_contents(
            $this->arquivo,
            json_encode(['token' => $token, 'expires' => $expiraEm]),
            LOCK_EX,
        );
    }

    public function invalidar(): void
    {
        @unlink($this->arquivo);
    }

    /** Token ainda utilizável (fora da janela de renovação)? */
    public function tokenValido(): ?string
    {
        $dados = $this->ler();

        if ($dados === null) {
            return null;
        }

        return time() < ($dados['expires'] - $this->skewSegundos) ? $dados['token'] : null;
    }
}

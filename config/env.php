<?php
/**
 * Leitor simples do arquivo .env (na raiz do projeto).
 *
 * Reaproveita o MESMO .env usado pela versão Next.js — mantém as credenciais
 * da API e as chaves públicas num único lugar. Faz cache em variável estática.
 */
function env(string $key, ?string $default = null): ?string {
    static $vars = null;

    if ($vars === null) {
        $vars = [];
        $path = dirname(__DIR__) . '/.env';
        if (is_file($path)) {
            foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#') {
                    continue;
                }
                $pos = strpos($line, '=');
                if ($pos === false) {
                    continue;
                }
                $k = trim(substr($line, 0, $pos));
                $v = trim(substr($line, $pos + 1));
                // Remove aspas envolventes, se houver.
                if (strlen($v) >= 2 && ($v[0] === '"' || $v[0] === "'") && $v[strlen($v) - 1] === $v[0]) {
                    $v = substr($v, 1, -1);
                }
                $vars[$k] = $v;
            }
        }
    }

    return array_key_exists($key, $vars) && $vars[$key] !== '' ? $vars[$key] : $default;
}

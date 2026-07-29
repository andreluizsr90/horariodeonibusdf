<?php

/**
 * Router para o servidor embutido do PHP (`php -S`) — apenas desenvolvimento.
 * Serve arquivos estáticos existentes e delega o resto ao front controller,
 * replicando o que o nginx faz em produção.
 *
 * Uso: php -S localhost:8080 -t public public/router.php
 */
$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');

if ($path !== '/' && is_file(__DIR__ . $path)) {
    return false; // deixa o servidor embutido servir o arquivo
}

require __DIR__ . '/index.php';

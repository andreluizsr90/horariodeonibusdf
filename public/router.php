<?php
/**
 * Router para o servidor embutido do PHP (php -S) — apenas para desenvolvimento.
 * Serve arquivos estáticos existentes em /public e encaminha o resto para o
 * front controller (index.php), replicando o que o .htaccess faz no Apache.
 *
 * Uso: php -S localhost:8080 -t public public/router.php
 */
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');

$static = __DIR__ . $uri;
if ($uri !== '/' && is_file($static)) {
    return false; // deixa o servidor embutido servir o arquivo estático
}

// O Trongate usa requires relativos ('../engine/...') que resolvem contra o
// CWD. No Apache o CWD é a pasta public/; aqui garantimos o mesmo.
chdir(__DIR__);
require __DIR__ . '/index.php';

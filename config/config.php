<?php
//The main config file
require_once __DIR__ . '/env.php';

/*
 * BASE_URL é detectada a partir do host da requisição — assim os links/assets
 * funcionam tanto localmente (localhost:8080) quanto em produção, sem editar
 * config. Já a URL PÚBLICA canônica vem do .env (SITE_URL / NEXT_PUBLIC_SITE_URL).
 */
$__proto = (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') ? 'https' : 'http';
$__host = $_SERVER['HTTP_HOST'] ?? 'localhost';
define('BASE_URL', $__proto . '://' . $__host . '/');

// URL canônica pública (sem barra final) — usada em <link rel="canonical"> e OG.
define('SITE_URL', rtrim(env('SITE_URL', env('NEXT_PUBLIC_SITE_URL', $__proto . '://' . $__host)), '/'));

define('ENV', env('APP_ENV', 'dev'));
define('DEFAULT_MODULE', 'home');
define('DEFAULT_METHOD', 'index');
define('MODULE_ASSETS_TRIGGER', '_module');
define('ERROR_404', 'templates/error_404');

// ---- Identidade do site -----------------------------------------------------
define('SITE_NAME', 'Horário de Ônibus DF');
define('SITE_SHORT_NAME', 'Ônibus DF');
define('SITE_DESCRIPTION', 'Consulte horários, itinerários e linhas de ônibus do Distrito Federal e Entorno de forma rápida e gratuita.');

// ---- API externa de ônibus (privado — só no servidor) -----------------------
define('API_BASE_URL', rtrim(env('API_BASE_URL', ''), '/'));
define('API_EMAIL', env('API_EMAIL', ''));
define('API_PASSWORD', env('API_PASSWORD', ''));
define('API_TOKEN_REFRESH_SKEW', (int) env('API_TOKEN_REFRESH_SKEW_SECONDS', '60'));

// ---- Marketing / Tracking (público) ----------------------------------------
define('GA_ID', env('NEXT_PUBLIC_GA_ID', ''));
define('ADSENSE_CLIENT', env('NEXT_PUBLIC_ADSENSE_CLIENT', ''));

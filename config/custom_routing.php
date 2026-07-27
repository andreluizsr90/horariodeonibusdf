<?php
/**
 * Roteamento personalizado.
 *
 * Convenção do projeto: rotas ALIAS renderizam o MESMO conteúdo da rota
 * principal; o <link rel="canonical"> (definido no controller) sempre aponta
 * para a rota PRINCIPAL, evitando conteúdo duplicado.
 *
 * Observação: (:any) casa `[^\/]+`, portanto não atravessa barras — as rotas
 * mais específicas (…/localizacao) não colidem com as genéricas.
 */
$routes = [
    'tg-admin' => 'login/login/tg-admin',

    // ---- SEO -------------------------------------------------------------
    'sitemap.xml' => 'seo/sitemap',
    'robots.txt' => 'seo/robots',

    // ---- Localização em tempo real (GPS) ---------------------------------
    // Principal + aliases (canonical → /linhas/{slug}/localizacao).
    'linhas/(:any)/localizacao' => 'linhas/localizacao/$1',
    'linha/(:any)/localizacao' => 'linhas/localizacao/$1',
    'travel/live/(:any)' => 'linhas/localizacao/$1',

    // ---- Detalhe da linha -------------------------------------------------
    'travel/(:any)' => 'linhas/detalhe/$1',   // alias
    'linhas/(:any)' => 'linhas/detalhe/$1',   // principal

    // ---- Cidades ----------------------------------------------------------
    'city/(:any)' => 'cidades/detalhe/$1',    // alias
    'cidades/(:any)' => 'cidades/detalhe/$1', // principal
    'city' => 'cidades/index',                // alias de /cidades

    // ---- Tarifas ----------------------------------------------------------
    'tarifas/distrito-federal' => 'tarifas/distrito_federal',
    'tarifas/cidades-entorno' => 'tarifas/cidades_entorno',
    'pages/tarifas-distrito-federal' => 'tarifas/distrito_federal', // alias
    'pages/tarifas-entorno' => 'tarifas/cidades_entorno',           // alias

    // ---- Achados e Perdidos ----------------------------------------------
    'achados-e-perdidos' => 'achados/index',
    'pages/achados-e-perdidos' => 'achados/index', // alias
];
define('CUSTOM_ROUTES', $routes);

<?php

declare(strict_types=1);

namespace App\Http\Controller;

use App\Api\ApiIndisponivelException;
use App\Api\BusRepository;
use App\Support\Config;
use Laminas\Diactoros\Response\JsonResponse;
use Laminas\Diactoros\Response\TextResponse;
use Psr\Http\Message\ResponseInterface;

/**
 * sitemap.xml, robots.txt e o manifest do PWA.
 *
 * O sitemap lista SOMENTE URLs canônicas — aliases ficam de fora, e "/linhas"
 * também (seu canonical aponta para a home).
 */
final class SeoController
{
    public function __construct(
        private readonly BusRepository $repo,
        private readonly Config $config,
    ) {
    }

    public function sitemap(): ResponseInterface
    {
        $hoje = date('Y-m-d');

        $urls = [
            ['/', 'daily', '1.0'],
            ['/cidades', 'weekly', '0.8'],
            ['/tarifas', 'monthly', '0.5'],
            ['/tarifas/distrito-federal', 'monthly', '0.4'],
            ['/tarifas/cidades-entorno', 'monthly', '0.4'],
            ['/achados-e-perdidos', 'yearly', '0.4'],
        ];

        try {
            foreach ($this->repo->cidades() as $cidade) {
                $urls[] = ['/cidades/' . rawurlencode($cidade->slug), 'weekly', '0.6'];
            }
            foreach ($this->repo->linhas() as $linha) {
                $urls[] = ['/linhas/' . rawurlencode($linha->slug), 'weekly', '0.7'];
            }
        } catch (ApiIndisponivelException) {
            // Degrada para as rotas estáticas.
        }

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($urls as [$path, $freq, $pri]) {
            $xml .= '  <url>' . "\n"
                . '    <loc>' . htmlspecialchars($this->config->url($path), ENT_XML1) . '</loc>' . "\n"
                . '    <lastmod>' . $hoje . '</lastmod>' . "\n"
                . '    <changefreq>' . $freq . '</changefreq>' . "\n"
                . '    <priority>' . $pri . '</priority>' . "\n"
                . '  </url>' . "\n";
        }

        $xml .= '</urlset>';

        return new TextResponse($xml, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
    }

    public function robots(): ResponseInterface
    {
        $linhas = [
            'User-agent: *',
            'Allow: /',
            // Aliases existem por compatibilidade; o canonical já consolida.
            'Disallow: /pages/',
            'Disallow: /city',
            'Disallow: /travel/',
            'Disallow: /linha/',
            // Resultados de busca não devem ser rastreados.
            'Disallow: /linhas?q=',
            '',
            'Sitemap: ' . $this->config->url('/sitemap.xml'),
            'Host: ' . $this->config->siteUrl,
            '',
        ];

        return new TextResponse(implode("\n", $linhas), 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }

    /** Web App Manifest — torna o site instalável como aplicativo (PWA). */
    public function manifest(): ResponseInterface
    {
        return new JsonResponse([
            'name' => $this->config->siteName . ' — Horários, Linhas e Itinerários',
            'short_name' => $this->config->siteShortName,
            'description' => $this->config->siteDescription,
            'id' => '/',
            'start_url' => '/',
            'scope' => '/',
            'display' => 'standalone',
            'orientation' => 'portrait',
            'background_color' => '#ffffff',
            'theme_color' => '#1d63f1',
            'lang' => 'pt-BR',
            'dir' => 'ltr',
            'categories' => ['travel', 'navigation', 'utilities'],
            'icons' => [
                ['src' => '/assets/img/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any'],
                ['src' => '/assets/img/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'any'],
                ['src' => '/assets/img/icon-maskable-512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'maskable'],
            ],
        ], 200, ['Content-Type' => 'application/manifest+json']);
    }
}

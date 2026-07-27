<?php
/**
 * Módulo SEO — sitemap.xml e robots.txt dinâmicos.
 *
 * O sitemap lista SOMENTE as rotas canônicas (as aliases são omitidas de
 * propósito, para não duplicar conteúdo no índice). "/linhas" também fica de
 * fora, pois seu canonical aponta para a home.
 */
class Seo extends Trongate {

    public function sitemap(): void {
        header('Content-Type: application/xml; charset=utf-8');
        $hoje = date('Y-m-d');

        $urls = [
            ['loc' => SITE_URL . '/', 'freq' => 'daily', 'pri' => '1.0'],
            ['loc' => SITE_URL . '/cidades', 'freq' => 'weekly', 'pri' => '0.8'],
            ['loc' => SITE_URL . '/tarifas', 'freq' => 'monthly', 'pri' => '0.5'],
            ['loc' => SITE_URL . '/tarifas/distrito-federal', 'freq' => 'monthly', 'pri' => '0.4'],
            ['loc' => SITE_URL . '/tarifas/cidades-entorno', 'freq' => 'monthly', 'pri' => '0.4'],
            ['loc' => SITE_URL . '/achados-e-perdidos', 'freq' => 'yearly', 'pri' => '0.4'],
        ];

        // Rotas dinâmicas — degradam graciosamente se a API estiver fora.
        try {
            foreach ($this->busapi->get_cidades() as $c) {
                $urls[] = ['loc' => SITE_URL . '/cidades/' . rawurlencode($c['slug']), 'freq' => 'weekly', 'pri' => '0.6'];
            }
            foreach ($this->busapi->get_linhas() as $l) {
                $urls[] = ['loc' => SITE_URL . '/linhas/' . rawurlencode($l['slug']), 'freq' => 'weekly', 'pri' => '0.7'];
            }
        } catch (Throwable $e) {
            // Mantém apenas as rotas estáticas.
        }

        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $u) {
            echo "  <url>\n";
            echo '    <loc>' . htmlspecialchars($u['loc'], ENT_XML1) . "</loc>\n";
            echo '    <lastmod>' . $hoje . "</lastmod>\n";
            echo '    <changefreq>' . $u['freq'] . "</changefreq>\n";
            echo '    <priority>' . $u['pri'] . "</priority>\n";
            echo "  </url>\n";
        }
        echo '</urlset>';
    }

    public function robots(): void {
        header('Content-Type: text/plain; charset=utf-8');
        echo "User-agent: *\n";
        echo "Allow: /\n";
        // Aliases existem só por compatibilidade; o canonical já consolida.
        echo "Disallow: /pages/\n";
        echo "Disallow: /city\n";
        echo "Disallow: /travel/\n";
        echo "Disallow: /linha/\n\n";
        echo 'Sitemap: ' . SITE_URL . "/sitemap.xml\n";
        echo 'Host: ' . SITE_URL . "\n";
    }
}

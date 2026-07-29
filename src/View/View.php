<?php

declare(strict_types=1);

namespace App\View;

use App\Support\Config;
use Fenom;
use Laminas\Diactoros\Response\HtmlResponse;
use Psr\Http\Message\ResponseInterface;

/**
 * Renderização de templates com Fenom.
 *
 * Auto-escape está LIGADO: `{$var}` sai escapado por padrão, eliminando a
 * necessidade de chamar htmlspecialchars manualmente em cada saída (fonte
 * comum de XSS quando esquecido).
 */
final class View
{
    private Fenom $fenom;

    private readonly string $publicDir;

    public function __construct(
        private readonly Config $config,
        string $templateDir,
        ?string $publicDir = null,
    ) {
        $this->publicDir = $publicDir ?? dirname($templateDir) . "/public";
        $cacheDir = $config->cacheDir . '/templates';

        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0775, true);
        }

        $this->fenom = Fenom::factory($templateDir, $cacheDir, Fenom::AUTO_ESCAPE);

        // Em desenvolvimento, recompila quando o template muda.
        if ($config->debug) {
            $this->fenom->setOptions(Fenom::FORCE_COMPILE);
        }

        $this->registrarModificadores();
    }

    /**
     * Renderiza uma página dentro do layout global.
     *
     * @param array<string, mixed> $dados
     */
    public function render(string $template, Meta $meta, array $dados = [], int $status = 200): ResponseInterface
    {
        $html = $this->fenom->fetch($template, $dados + [
            'meta' => [
                'title' => $meta->title === $this->config->siteName
                    ? $this->config->siteName . ' — Horários, Linhas e Itinerários'
                    : $meta->title . ' | ' . $this->config->siteName,
                'description' => $meta->description ?? $this->config->siteDescription,
                'canonical' => $this->config->url($meta->canonical),
                'noindex' => $meta->noindex,
            ],
            'site' => [
                'name' => $this->config->siteName,
                'short_name' => $this->config->siteShortName,
                'url' => $this->config->siteUrl,
                'ano' => date('Y'),
            ],
            'ads' => ['client' => $this->config->adsenseClient],
            'ga_id' => $this->config->gaId,
            // Cache busting: a URL muda quando o arquivo muda, então o cache
            // do navegador/service worker é invalidado naturalmente.
            'assets' => [
                'css' => '/assets/css/app.css?v=' . $this->versaoAsset('/assets/css/app.css'),
                'js' => '/assets/js/site.js?v=' . $this->versaoAsset('/assets/js/site.js'),
            ],
        ]);

        return new HtmlResponse($html, $status);
    }

    /**
     * Renderiza um template SEM o layout global — usado nos fragmentos HTML
     * carregados por fetch (ex.: a seção de favoritos).
     *
     * @param array<string, mixed> $dados
     */
    public function renderFragmento(string $template, array $dados = []): ResponseInterface
    {
        return new HtmlResponse($this->fenom->fetch($template, $dados + [
            'ads' => ['client' => $this->config->adsenseClient],
        ]));
    }

    /** Timestamp de modificação do asset, usado como "cache buster". */
    private function versaoAsset(string $caminho): string
    {
        $arquivo = $this->publicDir . $caminho;

        return is_file($arquivo) ? (string) filemtime($arquivo) : '1';
    }

    private function registrarModificadores(): void
    {
        // {$texto|titulo} → "Aguas Lindas de Goias"
        $this->fenom->addModifier('titulo', \App\Support\Slug::titulo(...));

        // {$tel|telhref} → "tel:+556133442769"
        $this->fenom->addModifier(
            'telhref',
            static fn (string $tel): string => 'tel:+55' . preg_replace('/\D/', '', $tel),
        );

        // {$valor|json} → JSON seguro para embutir em atributo/script.
        $this->fenom->addModifier(
            'json',
            static fn (mixed $v): string => (string) json_encode($v, JSON_UNESCAPED_UNICODE | JSON_HEX_APOS | JSON_HEX_QUOT),
        );
    }
}

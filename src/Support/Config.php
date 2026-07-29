<?php

declare(strict_types=1);

namespace App\Support;

use Dotenv\Dotenv;

/**
 * Configuração da aplicação, lida do .env uma única vez.
 *
 * Segredos (credenciais da API) NUNCA são expostos ao cliente — só as chaves
 * públicas (GA/AdSense) chegam ao HTML.
 */
final class Config
{
    private static ?self $instance = null;

    private function __construct(
        public readonly string $siteUrl,
        public readonly string $siteName,
        public readonly string $siteShortName,
        public readonly string $siteDescription,
        public readonly string $apiBaseUrl,
        public readonly string $apiEmail,
        public readonly string $apiPassword,
        public readonly int $apiRefreshSkew,
        public readonly string $gaId,
        public readonly string $adsenseClient,
        public readonly bool $debug,
        public readonly string $cacheDir,
    ) {
    }

    public static function load(string $rootDir): self
    {
        if (self::$instance instanceof self) {
            return self::$instance;
        }

        if (is_file($rootDir . '/.env')) {
            Dotenv::createImmutable($rootDir)->safeLoad();
        }

        $env = static fn (string $key, string $default = ''): string
            => (string) ($_ENV[$key] ?? $_SERVER[$key] ?? getenv($key) ?: $default);

        // Aceita SITE_URL ou o nome legado NEXT_PUBLIC_SITE_URL.
        $siteUrl = $env('SITE_URL') ?: $env('NEXT_PUBLIC_SITE_URL') ?: self::detectarUrl();

        // Cache do Fenom: precisa ser gravável. Em container não-root o
        // diretório do projeto é somente-leitura, então usamos o temp do SO.
        $cacheDir = $env('CACHE_DIR') ?: sys_get_temp_dir() . '/honibusdf-cache';

        return self::$instance = new self(
            siteUrl: rtrim($siteUrl, '/'),
            siteName: 'Horário de Ônibus DF',
            siteShortName: 'Ônibus DF',
            siteDescription: 'Consulte horários, itinerários e linhas de ônibus do Distrito Federal e Entorno de forma rápida e gratuita.',
            apiBaseUrl: rtrim($env('API_BASE_URL'), '/'),
            apiEmail: $env('API_EMAIL'),
            apiPassword: $env('API_PASSWORD'),
            apiRefreshSkew: (int) ($env('API_TOKEN_REFRESH_SKEW_SECONDS', '60') ?: '60'),
            gaId: $env('GA_ID') ?: $env('NEXT_PUBLIC_GA_ID'),
            adsenseClient: $env('ADSENSE_CLIENT') ?: $env('NEXT_PUBLIC_ADSENSE_CLIENT'),
            debug: in_array(strtolower($env('APP_ENV', 'prod')), ['dev', 'local', 'development'], true),
            cacheDir: $cacheDir,
        );
    }

    public static function get(): self
    {
        return self::$instance ?? throw new \RuntimeException('Config não carregada.');
    }

    /** URL absoluta a partir de um caminho ("/cidades" → "https://…/cidades"). */
    public function url(string $path = '/'): string
    {
        return $this->siteUrl . '/' . ltrim($path, '/');
    }

    private static function detectarUrl(): string
    {
        $https = ($_SERVER['HTTPS'] ?? '') !== '' && strtolower((string) $_SERVER['HTTPS']) !== 'off';

        return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
    }
}

<?php

declare(strict_types=1);

namespace App\Api;

use App\Support\Config;
use Composer\CaBundle\CaBundle;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use Psr\Http\Message\RequestInterface;

/**
 * Cliente HTTP da API externa de ônibus.
 *
 * - **Autenticação**: token com cache em arquivo (TokenStore) e renovação
 *   automática dentro da janela de "skew".
 * - **Bearer**: injetado por MIDDLEWARE do Guzzle, então nenhuma chamada
 *   precisa lembrar de adicionar o header.
 * - **Retry em 401**: uma única reautenticação seguida da repetição da
 *   requisição original.
 * - **SSL**: usa o CA bundle do composer/ca-bundle, funcionando em qualquer
 *   ambiente (inclusive PHP no Windows, sem curl.cainfo configurado).
 */
final class BusApiClient
{
    private const HEADER_RETRY = 'X-Auth-Retry';

    private Client $http;

    public function __construct(
        private readonly Config $config,
        private readonly TokenStore $tokens,
    ) {
        $stack = HandlerStack::create();

        // Injeta o Bearer em toda requisição (exceto o próprio /api/auth).
        $stack->push(Middleware::mapRequest(function (RequestInterface $req): RequestInterface {
            if (str_ends_with($req->getUri()->getPath(), '/api/auth')) {
                return $req;
            }

            return $req->withHeader('Authorization', 'Bearer ' . $this->token());
        }), 'bearer');

        $this->http = new Client([
            'base_uri' => $this->config->apiBaseUrl . '/',
            'timeout' => 20,
            'connect_timeout' => 10,
            'handler' => $stack,
            'headers' => ['Accept' => 'application/json'],
            'verify' => CaBundle::getSystemCaRootBundlePath(),
        ]);
    }

    // ------------------------------------------------------------------
    //  Autenticação
    // ------------------------------------------------------------------

    private function token(): string
    {
        return $this->tokens->tokenValido() ?? $this->autenticar();
    }

    private function autenticar(): string
    {
        if ($this->config->apiBaseUrl === '') {
            throw new ApiIndisponivelException('API_BASE_URL não configurada (.env).');
        }

        try {
            $res = $this->http->post('api/auth', [
                'json' => [
                    'email' => $this->config->apiEmail,
                    'password' => $this->config->apiPassword,
                ],
            ]);
        } catch (GuzzleException $e) {
            throw new ApiIndisponivelException('Falha na autenticação: ' . $e->getMessage(), previous: $e);
        }

        $json = json_decode((string) $res->getBody(), true);
        // A API encapsula em { success, data: { token, expires_at } }.
        $payload = is_array($json['data'] ?? null) ? $json['data'] : (array) $json;
        $token = $payload['token'] ?? $payload['access_token'] ?? null;

        if (!is_string($token) || $token === '') {
            throw new ApiIndisponivelException('Resposta de autenticação inválida: token ausente.');
        }

        $expira = isset($payload['expires_at']) ? strtotime((string) $payload['expires_at']) : false;
        $this->tokens->gravar($token, $expira !== false ? $expira : time() + 3600);

        return $token;
    }

    // ------------------------------------------------------------------
    //  HTTP
    // ------------------------------------------------------------------

    /**
     * GET autenticado. Em 401, invalida o token, reautentica e repete UMA vez.
     *
     * @param array<string, string> $query
     * @return array<mixed>
     */
    private function get(string $path, array $query = [], bool $jaTentou = false): array
    {
        try {
            $res = $this->http->get($path, [
                'query' => $query,
                // Marca a tentativa para não entrar em laço de retry.
                'headers' => $jaTentou ? [self::HEADER_RETRY => '1'] : [],
            ]);
        } catch (ClientException $e) {
            $status = $e->getResponse()->getStatusCode();

            if ($status === 401 && !$jaTentou) {
                $this->tokens->invalidar();

                return $this->get($path, $query, true);
            }

            if ($status === 404) {
                return ['__not_found' => true];
            }

            throw new ApiIndisponivelException("Erro GET {$path} (HTTP {$status}).", previous: $e);
        } catch (GuzzleException $e) {
            throw new ApiIndisponivelException("Erro de conexão em GET {$path}.", previous: $e);
        }

        $json = json_decode((string) $res->getBody(), true);

        return is_array($json) ? $json : [];
    }

    /**
     * Desembrulha coleções em { data: [...] } / { items: [...] }.
     *
     * @param array<mixed> $payload
     * @return list<array<mixed>>
     */
    private function colecao(array $payload): array
    {
        foreach (['data', 'items'] as $chave) {
            if (isset($payload[$chave]) && is_array($payload[$chave])) {
                return array_values(array_filter($payload[$chave], 'is_array'));
            }
        }

        return array_is_list($payload) ? array_values(array_filter($payload, 'is_array')) : [];
    }

    // ------------------------------------------------------------------
    //  Endpoints
    // ------------------------------------------------------------------

    /** @return list<array<mixed>> */
    public function cidades(): array
    {
        return $this->colecao($this->get('api/onibus/cidades'));
    }

    /**
     * @param array<string, string> $query
     * @return list<array<mixed>>
     */
    public function linhas(array $query = []): array
    {
        return $this->colecao($this->get('api/onibus/linhas', $query));
    }

    /** @return array<mixed>|null */
    public function linha(string $slug): ?array
    {
        $payload = $this->get('api/onibus/linhas/' . rawurlencode($slug));

        if (isset($payload['__not_found'])) {
            return null;
        }

        $raw = is_array($payload['data'] ?? null) ? $payload['data'] : $payload;

        return $raw === [] ? null : $raw;
    }
}

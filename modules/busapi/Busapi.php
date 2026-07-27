<?php
/**
 * Cliente da API externa de ônibus (brasiliaeaqui.com.br).
 *
 * Porta, para PHP, a lógica que na versão Next.js estava em:
 *   token-manager.ts  → auth com cache + renovação por "skew"
 *   http-client.ts    → GET autenticado (Bearer) + retry único em 401
 *   bus-api-repository.ts → mapeamento dos DTOs para o modelo do domínio
 *
 * O token é cacheado em ARQUIVO (compartilhado entre requisições PHP), o que
 * dispensa reautenticar a cada request — a API expira o token em 1h.
 *
 * É um módulo interno: `block_url()` impede acesso direto por URL.
 */
class Busapi extends Trongate {

    private string $cache_file;

    public function __construct(?string $module_name = null) {
        parent::__construct($module_name);
        block_url('busapi');
        $this->cache_file = sys_get_temp_dir() . '/honibusdf_token.json';
    }

    // ===================== Autenticação / token =========================

    /** Faz login e devolve ['token' => ..., 'expires' => epoch_seconds]. */
    private function authenticate(): array {
        if (API_BASE_URL === '') {
            throw new Exception('API_BASE_URL não configurada (.env).');
        }

        [$status, $body] = $this->http(
            'POST',
            API_BASE_URL . '/api/auth',
            ['email' => API_EMAIL, 'password' => API_PASSWORD]
        );

        if ($status !== 200) {
            throw new Exception("Falha na autenticação (HTTP {$status}). {$body}");
        }

        $json = json_decode($body, true);
        // A API encapsula em { success, data: { token, expires_at } }.
        $payload = $json['data'] ?? $json;
        $token = $payload['token'] ?? $payload['access_token'] ?? null;
        if (!$token) {
            throw new Exception('Resposta de autenticação inválida: token ausente.');
        }

        $raw_expires = $payload['expires_at'] ?? $payload['expiresAt'] ?? null;
        $expires = $raw_expires ? strtotime($raw_expires) : (time() + 3600);
        if ($expires === false) {
            $expires = time() + 3600;
        }

        $cached = ['token' => $token, 'expires' => $expires];
        @file_put_contents($this->cache_file, json_encode($cached), LOCK_EX);
        return $cached;
    }

    /** Retorna um token válido, reautenticando se estiver perto de expirar. */
    private function get_valid_token(): string {
        $cached = null;
        if (is_file($this->cache_file)) {
            $cached = json_decode((string) file_get_contents($this->cache_file), true);
        }

        $expiring = !is_array($cached)
            || !isset($cached['token'], $cached['expires'])
            || time() >= ($cached['expires'] - API_TOKEN_REFRESH_SKEW);

        if ($expiring) {
            $cached = $this->authenticate();
        }

        return $cached['token'];
    }

    /** Invalida o cache e reautentica (usado após um 401). */
    private function force_reauth(): string {
        @unlink($this->cache_file);
        return $this->authenticate()['token'];
    }

    // ===================== HTTP =========================================

    /** Executa uma requisição HTTP. Retorna [status, body]. */
    private function http(string $method, string $url, ?array $json_body = null, array $headers = []): array {
        $ch = curl_init($url);
        $default_headers = ['Accept: application/json'];
        if ($json_body !== null) {
            $default_headers[] = 'Content-Type: application/json';
        }

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => array_merge($default_headers, $headers),
            CURLOPT_TIMEOUT => 20,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);

        // CA bundle empacotado — garante verificação SSL mesmo em ambientes
        // (ex.: PHP no Windows) sem CA configurado. Em servidores Linux com CA
        // do sistema, este arquivo apenas reforça; se ausente, usa o do sistema.
        $cacert = dirname(__DIR__, 2) . '/config/cacert.pem';
        if (is_file($cacert)) {
            curl_setopt($ch, CURLOPT_CAINFO, $cacert);
        }
        if ($json_body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($json_body));
        }

        $body = curl_exec($ch);
        if ($body === false) {
            $err = curl_error($ch);
            curl_close($ch);
            throw new Exception("Erro de conexão com a API: {$err}");
        }
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [$status, (string) $body];
    }

    /** GET autenticado com retry único em 401. Retorna o array decodificado. */
    private function api_get(string $path, array $query = []): array {
        if (API_BASE_URL === '') {
            throw new Exception('API_BASE_URL não configurada (.env).');
        }

        $url = API_BASE_URL . $path;
        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }

        $token = $this->get_valid_token();
        [$status, $body] = $this->http('GET', $url, null, ['Authorization: Bearer ' . $token]);

        if ($status === 401) {
            $token = $this->force_reauth();
            [$status, $body] = $this->http('GET', $url, null, ['Authorization: Bearer ' . $token]);
        }

        if ($status === 404) {
            return ['__not_found' => true];
        }
        if ($status < 200 || $status >= 300) {
            throw new Exception("Erro GET {$path} (HTTP {$status}). {$body}");
        }

        $json = json_decode($body, true);
        return is_array($json) ? $json : [];
    }

    private function unwrap(array $payload): array {
        if (isset($payload['data']) && is_array($payload['data'])) {
            return $payload['data'];
        }
        if (isset($payload['items']) && is_array($payload['items'])) {
            return $payload['items'];
        }
        return array_is_list($payload) ? $payload : [];
    }

    // ===================== Endpoints públicos ===========================

    /** Lista as cidades disponíveis (mapeadas e ordenadas por nome). */
    public function get_cidades(): array {
        $payload = $this->api_get('/api/onibus/cidades');
        $cidades = array_map([$this, 'map_cidade'], $this->unwrap($payload));
        usort($cidades, fn($a, $b) => strcoll($a['nome'], $b['nome']));
        return $cidades;
    }

    /** Busca uma cidade pelo slug (ou null). */
    public function get_cidade(string $slug): ?array {
        foreach ($this->get_cidades() as $cidade) {
            if ($cidade['slug'] === $slug) {
                return $cidade;
            }
        }
        return null;
    }

    /**
     * Lista as linhas (mapeadas). Se $cidade_slug for informado, filtra por
     * cidade — no servidor (query) e, como fallback, no cliente.
     */
    public function get_linhas(string $cidade_slug = ''): array {
        $query = $cidade_slug !== '' ? ['cidade' => $cidade_slug] : [];
        $payload = $this->api_get('/api/onibus/linhas', $query);
        $linhas = array_map([$this, 'map_linha'], $this->unwrap($payload));

        if ($cidade_slug !== '') {
            $filtradas = array_values(array_filter(
                $linhas,
                fn($l) => ($l['cidadeSlug'] ?? null) === $cidade_slug
            ));
            if (!empty($filtradas)) {
                $linhas = $filtradas;
            }
        }

        usort($linhas, fn($a, $b) => strnatcasecmp($a['numero'], $b['numero']));
        return $linhas;
    }

    /** Detalhe de uma linha pelo slug, ou null se não existir. */
    public function get_linha(string $slug): ?array {
        $payload = $this->api_get('/api/onibus/linhas/' . rawurlencode($slug));
        if (isset($payload['__not_found'])) {
            return null;
        }
        $raw = (isset($payload['data']) && is_array($payload['data'])) ? $payload['data'] : $payload;
        if (empty($raw)) {
            return null;
        }
        return $this->map_linha_detalhe($raw);
    }

    // ===================== Mapeadores ===================================

    private function is_semob_slug(string $slug): bool {
        return !preg_match('/^antt[-_]/i', $slug);
    }

    /**
     * Gera um slug URL-safe (usado quando a API não fornece um).
     *
     * Não depende de `iconv` — a extensão não existe em algumas imagens PHP
     * (ex.: trafex/php-nginx). A remoção de acentos é feita via decomposição
     * Unicode (Normalizer, quando disponível) com fallback por tabela.
     */
    private function slugify(string $texto): string {
        $t = mb_strtolower($texto, 'UTF-8');

        if (class_exists('Normalizer')) {
            // NFD separa a letra da marca diacrítica; removemos as marcas.
            $t = Normalizer::normalize($t, Normalizer::FORM_D) ?: $t;
            $t = preg_replace('/\p{Mn}+/u', '', $t);
        } else {
            $t = strtr($t, [
                'á'=>'a','à'=>'a','ã'=>'a','â'=>'a','ä'=>'a',
                'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e',
                'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i',
                'ó'=>'o','ò'=>'o','õ'=>'o','ô'=>'o','ö'=>'o',
                'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u',
                'ç'=>'c','ñ'=>'n',
            ]);
        }

        $t = preg_replace('/[^a-z0-9]+/', '-', $t);
        return trim($t, '-');
    }

    private function map_cidade(array $raw): array {
        $nome = (string) ($raw['nome'] ?? $raw['name'] ?? 'Cidade');
        // Preserva o slug fornecido pela API; só gera um quando ausente.
        $slug = !empty($raw['slug']) ? trim((string) $raw['slug']) : $this->slugify($nome);
        return [
            'id' => (string) ($raw['id'] ?? $raw['_id'] ?? $slug),
            'nome' => $nome,
            'slug' => $slug,
            'uf' => $raw['uf'] ?? $raw['estado'] ?? null,
            'totalLinhas' => $raw['totalLinhas'] ?? $raw['total_linhas'] ?? null,
        ];
    }

    private function map_linha(array $raw): array {
        $numero = (string) ($raw['numero'] ?? $raw['number'] ?? $raw['codigo'] ?? '');
        $nome = (string) ($raw['nome'] ?? $raw['name'] ?? ($numero !== '' ? $numero : 'Linha'));
        $slug = trim((string) ($raw['slug'] ?? ''));
        return [
            'id' => (string) ($raw['id'] ?? $raw['_id'] ?? $slug),
            'numero' => $numero,
            'nome' => $nome,
            'slug' => $slug,
            'origem' => $raw['origem'] ?? null,
            'destino' => $raw['destino'] ?? null,
            'cidadeSlug' => $raw['cidadeSlug'] ?? $raw['cidade_slug'] ?? null,
            'cidadeNome' => $raw['cidade_nome'] ?? $raw['cidade'] ?? $raw['estado'] ?? null,
            'operadora' => $raw['operadora'] ?? $raw['empresa'] ?? null,
            'semob' => $slug !== '' ? $this->is_semob_slug($slug) : true,
        ];
    }

    private const LABEL_TIPO_DIA = [
        'util' => 'Dias úteis',
        'uteis' => 'Dias úteis',
        'sabado' => 'Sábado',
        'domingo' => 'Domingo e feriados',
        'feriado' => 'Feriados',
    ];
    private const LABEL_SENTIDO = ['ida' => 'Ida', 'volta' => 'Volta'];

    private function label_dia(?string $raw): string {
        if (!$raw) return 'Horários';
        return self::LABEL_TIPO_DIA[strtolower($raw)] ?? $raw;
    }

    private function label_sentido(string $raw): string {
        return self::LABEL_SENTIDO[strtolower($raw)] ?? ucfirst($raw);
    }

    /** Constrói os sentidos combinando itinerarios{ida,volta} + horarios[]. */
    private function map_sentidos(array $raw): array {
        $itin = (isset($raw['itinerarios']) && is_array($raw['itinerarios']) && !array_is_list($raw['itinerarios']))
            ? $raw['itinerarios'] : [];
        $horarios_raw = (isset($raw['horarios']) && is_array($raw['horarios'])) ? $raw['horarios'] : [];

        // Coleta chaves de sentido.
        $chaves = [];
        foreach (array_keys($itin) as $k) $chaves[strtolower($k)] = true;
        foreach ($horarios_raw as $h) {
            if (is_array($h) && !empty($h['sentido'])) $chaves[strtolower($h['sentido'])] = true;
        }
        $chaves = array_keys($chaves);

        // Ordena ida antes de volta.
        usort($chaves, fn($a, $b) => ($a === 'ida' ? 0 : ($a === 'volta' ? 1 : 2)) <=> ($b === 'ida' ? 0 : ($b === 'volta' ? 1 : 2)));

        $sentidos = [];
        foreach ($chaves as $chave) {
            $itinerario = (isset($itin[$chave]) && is_array($itin[$chave])) ? array_values($itin[$chave]) : [];

            $horarios = [];
            foreach ($horarios_raw as $h) {
                if (!is_array($h) || strtolower($h['sentido'] ?? '') !== $chave) continue;
                $saidas = $h['saidas'] ?? $h['horarios'] ?? [];
                if (empty($saidas)) continue;
                $horarios[] = [
                    'dia' => $h['dia'] ?? $h['categoria'] ?? $this->label_dia($h['tipo_dia'] ?? null),
                    'saidas' => array_values($saidas),
                ];
            }

            if (empty($itinerario) && empty($horarios)) continue;
            $sentidos[] = [
                'nome' => $this->label_sentido($chave),
                'itinerario' => $itinerario,
                'horarios' => $horarios,
            ];
        }

        // Fallback: dados planos, sem estrutura por sentido.
        if (empty($sentidos)) {
            $itinerario = $raw['itinerario'] ?? $raw['paradas'] ?? [];
            $horarios = [];
            foreach ($horarios_raw as $h) {
                if (!is_array($h)) continue;
                $saidas = $h['saidas'] ?? $h['horarios'] ?? [];
                if (empty($saidas)) continue;
                $horarios[] = ['dia' => $this->label_dia($h['tipo_dia'] ?? null), 'saidas' => array_values($saidas)];
            }
            if (!empty($itinerario) || !empty($horarios)) {
                $sentidos[] = ['nome' => 'Linha', 'itinerario' => array_values($itinerario), 'horarios' => $horarios];
            }
        }

        return $sentidos;
    }

    /** Normaliza [lat,lng] a partir de tupla ou objeto, validando faixas. */
    private function to_coord($raw): ?array {
        if (is_array($raw) && array_is_list($raw) && count($raw) >= 2) {
            $lat = $raw[0]; $lng = $raw[1];
        } elseif (is_array($raw)) {
            $lat = $raw['lat'] ?? $raw['latitude'] ?? $raw['y'] ?? null;
            $lng = $raw['lng'] ?? $raw['lon'] ?? $raw['long'] ?? $raw['longitude'] ?? $raw['x'] ?? null;
        } else {
            return null;
        }
        if (!is_numeric($lat) || !is_numeric($lng)) return null;
        $lat = (float) $lat; $lng = (float) $lng;
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) return null;
        return [$lat, $lng];
    }

    private function to_coords($raw): array {
        if (!is_array($raw)) return [];
        $out = [];
        foreach ($raw as $item) {
            $c = $this->to_coord($item);
            if ($c) $out[] = $c;
        }
        return $out;
    }

    /** Percurso { ida:[[lat,lng]], volta:[...] } ou null se vazio. */
    private function map_percurso(array $raw): ?array {
        $src = $raw['percurso'] ?? $raw['trajeto'] ?? $raw['rota'] ?? null;
        if (!is_array($src)) return null;
        $ida = $this->to_coords($src['ida'] ?? null);
        $volta = $this->to_coords($src['volta'] ?? null);
        if (empty($ida) && empty($volta)) return null;
        return ['ida' => $ida, 'volta' => $volta];
    }

    private function map_linha_detalhe(array $raw): array {
        $base = $this->map_linha($raw);
        $base['sentidos'] = $this->map_sentidos($raw);
        $base['percurso'] = $this->map_percurso($raw);
        // No detalhe, o bloco semob_extra é a confirmação autoritativa.
        $base['semob'] = isset($raw['semob_extra']) && is_array($raw['semob_extra']);
        $base['informacoesAdicionais'] = $raw['informacoesAdicionais'] ?? $raw['informacoes_adicionais'] ?? null;
        $base['tarifa'] = isset($raw['tarifa']) ? (string) $raw['tarifa'] : null;
        return $base;
    }
}

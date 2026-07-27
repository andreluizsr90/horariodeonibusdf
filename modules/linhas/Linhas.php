<?php
/**
 * Módulo Linhas — detalhe de uma linha de ônibus.
 * Rotas: /linhas/{slug} (principal) e /travel/{slug} (alias) → método detalhe().
 * O canonical aponta SEMPRE para /linhas/{slug}.
 */
class Linhas extends Trongate {

    /**
     * /linhas — listagem de TODAS as linhas.
     * Por decisão de SEO do projeto, o canonical aponta para a HOME ("/").
     */
    public function index(): void {
        try {
            $linhas = $this->busapi->get_linhas();
        } catch (Throwable $e) {
            $linhas = [];
        }

        $enxuto = array_map(fn($l) => [
            'slug' => $l['slug'], 'numero' => $l['numero'], 'nome' => $l['nome'],
            'origem' => $l['origem'], 'destino' => $l['destino'], 'semob' => $l['semob'],
        ], $linhas);

        $this->templates->public([
            'view_module' => 'linhas',
            'view_file' => 'todas',
            'title' => 'Todas as linhas',
            'description' => 'Lista completa de linhas de ônibus do Distrito Federal e Entorno.',
            'canonical' => '/',
            'linhas' => $enxuto,
        ]);
    }

    /**
     * Localização em tempo real (GPS) — /linhas/{slug}/localizacao.
     * Aliases: /linha/{slug}/localizacao e /travel/live/{slug}.
     * Página sem conteúdo estável → noindex.
     */
    public function localizacao(): void {
        $slug = segment(3);
        if ($slug === '') {
            $this->nao_encontrada('');
            return;
        }

        try {
            $linha = $this->busapi->get_linha($slug);
        } catch (Throwable $e) {
            $linha = null;
        }

        if (empty($linha)) {
            $this->nao_encontrada($slug);
            return;
        }

        $titulo = $this->titulo_linha($linha['numero'], $linha['nome']);

        $this->templates->public([
            'view_module' => 'linhas',
            'view_file' => 'localizacao',
            'title' => 'Localização em tempo real — ' . $titulo,
            'description' => 'Acompanhe no mapa, em tempo real, a posição dos ônibus da ' . $titulo . '.',
            'canonical' => '/linhas/' . $slug . '/localizacao',
            'noindex' => true, // conteúdo volátil (tempo real)
            'linha' => $linha,
            'titulo' => $titulo,
            'additional_includes_top' => [
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
            ],
        ]);
    }

    /**
     * Detalhe da linha. O slug vem do 3º segmento da URL (após o roteamento
     * custom reescrever /linhas/{slug} → linhas/detalhe/{slug}).
     */
    public function detalhe(): void {
        $slug = segment(3);
        if ($slug === '') {
            $this->nao_encontrada('');
            return;
        }

        try {
            $linha = $this->busapi->get_linha($slug);
        } catch (Throwable $e) {
            $linha = null;
            $erro = $e->getMessage();
        }

        if (empty($linha)) {
            $this->nao_encontrada($slug);
            return;
        }

        $titulo = $this->titulo_linha($linha['numero'], $linha['nome']);
        $rota = array_filter([$linha['origem'] ?? null, $linha['destino'] ?? null]);

        $data = [
            'view_module' => 'linhas',
            'view_file' => 'detalhe',
            'title' => $titulo,
            'description' => 'Horários, itinerário e informações da ' . $titulo . '.'
                . (!empty($rota) ? ' Trajeto: ' . implode(' → ', $rota) . '.' : ''),
            'canonical' => '/linhas/' . $slug,
            'linha' => $linha,
            'titulo' => $titulo,
        ];

        // Leaflet só quando há trajeto para desenhar.
        if (!empty($linha['percurso'])) {
            $data['additional_includes_top'] = [
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
                'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
            ];
        }

        $this->templates->public($data);
    }

    /** Página "linha não encontrada" (HTTP 404, noindex). */
    private function nao_encontrada(string $slug): void {
        http_response_code(404);
        $data = [
            'view_module' => 'linhas',
            'view_file' => 'nao_encontrada',
            'title' => 'Linha não encontrada',
            'canonical' => '/linhas/' . $slug,
            'noindex' => true,
        ];
        $this->templates->public($data);
    }

    /**
     * Título de exibição evitando redundância quando o `nome` já começa com o
     * número (ex.: número "0.111" + nome "0.111 Rodoviária…").
     */
    private function titulo_linha(string $numero, string $nome): string {
        $n = trim($nome);
        if ($numero !== '') {
            $esc = preg_quote($numero, '/');
            $n = trim(preg_replace('/^' . $esc . '\s*[-–—:\/]?\s*/u', '', $n));
        }
        if ($numero !== '' && $n !== '') return 'Linha ' . $numero . ' — ' . $n;
        if ($numero !== '') return 'Linha ' . $numero;
        return $n !== '' ? $n : 'Linha';
    }
}

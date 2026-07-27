<?php
/**
 * Módulo Cidades.
 * Rota principal: /cidades e /cidades/{slug}
 * Aliases: /city e /city/{slug} (canonical → rota principal).
 */
class Cidades extends Trongate {

    /** /cidades (e alias /city) — listagem das cidades. */
    public function index(): void {
        try {
            $cidades = $this->busapi->get_cidades();
            $erro = false;
        } catch (Throwable $e) {
            $cidades = [];
            $erro = true;
        }

        $this->templates->public([
            'view_module' => 'cidades',
            'view_file' => 'index',
            'title' => 'Cidades',
            'description' => 'Lista de cidades do Distrito Federal e Entorno com linhas de ônibus disponíveis.',
            'canonical' => '/cidades',
            'cidades' => $cidades,
            'erro' => $erro,
        ]);
    }

    /** /cidades/{slug} (e alias /city/{slug}) — linhas da cidade. */
    public function detalhe(): void {
        $slug = segment(3);
        if ($slug === '') {
            $this->index();
            return;
        }

        try {
            $cidade = $this->busapi->get_cidade($slug);
            $linhas = $cidade ? $this->busapi->get_linhas($slug) : [];
            $erro = false;
        } catch (Throwable $e) {
            $cidade = null;
            $linhas = [];
            $erro = true;
        }

        if (!$cidade && !$erro) {
            http_response_code(404);
            $this->templates->public([
                'view_module' => 'cidades',
                'view_file' => 'nao_encontrada',
                'title' => 'Cidade não encontrada',
                'canonical' => '/cidades/' . $slug,
                'noindex' => true,
            ]);
            return;
        }

        $nome = $cidade['nome'] ?? 'Cidade';
        $enxuto = array_map(fn($l) => [
            'slug' => $l['slug'], 'numero' => $l['numero'], 'nome' => $l['nome'],
            'origem' => $l['origem'], 'destino' => $l['destino'], 'semob' => $l['semob'],
        ], $linhas);

        $this->templates->public([
            'view_module' => 'cidades',
            'view_file' => 'detalhe',
            'title' => 'Linhas em ' . $nome,
            'description' => 'Horários e linhas de ônibus disponíveis em ' . $nome . '.',
            'canonical' => '/cidades/' . $slug,
            'cidade' => $cidade,
            'linhas' => $enxuto,
            'erro' => $erro,
        ]);
    }
}

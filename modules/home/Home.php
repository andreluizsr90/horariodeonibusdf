<?php
/**
 * Módulo Home — página inicial.
 * Lista as linhas (busca client-side) e destaca os favoritos no topo.
 */
class Home extends Trongate {

    public function index(): void {
        try {
            $linhas = $this->busapi->get_linhas();
        } catch (Throwable $e) {
            $linhas = [];
        }

        // Envia à view apenas os campos necessários para a busca/favoritos.
        $enxuto = array_map(fn($l) => [
            'slug' => $l['slug'],
            'numero' => $l['numero'],
            'nome' => $l['nome'],
            'origem' => $l['origem'],
            'destino' => $l['destino'],
            'semob' => $l['semob'],
        ], $linhas);

        $data = [
            'view_module' => 'home',
            'view_file' => 'home',
            'title' => SITE_NAME,
            'canonical' => '/',
            'linhas' => $enxuto,
        ];

        $this->templates->public($data);
    }
}

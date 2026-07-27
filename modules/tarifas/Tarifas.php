<?php
require_once __DIR__ . '/tarifas_data.php';

/**
 * Módulo Tarifas.
 * Rotas principais: /tarifas, /tarifas/distrito-federal, /tarifas/cidades-entorno
 * Aliases: /pages/tarifas-distrito-federal e /pages/tarifas-entorno
 *          (mesmo conteúdo; canonical SEMPRE aponta para a rota principal).
 */
class Tarifas extends Trongate {

    /** /tarifas — seleção entre DF e Entorno. */
    public function index(): void {
        $this->templates->public([
            'view_module' => 'tarifas',
            'view_file' => 'index',
            'title' => 'Tarifas',
            'description' => 'Consulte as tarifas do transporte público do Distrito Federal e das Cidades do Entorno.',
            'canonical' => '/tarifas',
        ]);
    }

    /** /tarifas/distrito-federal (e alias /pages/tarifas-distrito-federal). */
    public function distrito_federal(): void {
        $this->templates->public([
            'view_module' => 'tarifas',
            'view_file' => 'distrito_federal',
            'title' => 'Tarifas — Distrito Federal',
            'description' => 'Valores das tarifas do transporte público no Distrito Federal.',
            'canonical' => '/tarifas/distrito-federal',
            'tarifas' => TARIFAS_DF,
            'fonte' => FONTE_TARIFAS_DF,
        ]);
    }

    /** /tarifas/cidades-entorno (e alias /pages/tarifas-entorno). */
    public function cidades_entorno(): void {
        $this->templates->public([
            'view_module' => 'tarifas',
            'view_file' => 'cidades_entorno',
            'title' => 'Tarifas — Cidades do Entorno',
            'description' => 'Valores das tarifas do transporte nas Cidades do Entorno.',
            'canonical' => '/tarifas/cidades-entorno',
            'tarifas' => TARIFAS_ENTORNO,
            'fonte' => FONTE_TARIFAS_ENTORNO,
        ]);
    }
}

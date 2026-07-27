<?php
require_once __DIR__ . '/achados_data.php';

/**
 * Módulo Achados e Perdidos.
 * Rota principal: /achados-e-perdidos
 * Alias: /pages/achados-e-perdidos (canonical → rota principal).
 */
class Achados extends Trongate {

    public function index(): void {
        $this->templates->public([
            'view_module' => 'achados',
            'view_file' => 'index',
            'title' => 'Achados e Perdidos',
            'description' => 'Contatos das operadoras de ônibus do DF para recuperar itens perdidos no transporte público.',
            'canonical' => '/achados-e-perdidos',
            'intro' => INTRO_ACHADOS,
            'operadoras' => OPERADORAS,
        ]);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controller;

use App\View\Meta;
use App\View\View;
use Psr\Http\Message\ResponseInterface;

/** Páginas estáticas: tarifas e achados e perdidos (com seus aliases). */
final class PaginaController
{
    public function __construct(
        private readonly View $view,
        private readonly string $dataDir,
    ) {
    }

    /** @return array<mixed> */
    private function dados(string $arquivo): array
    {
        return require $this->dataDir . '/' . $arquivo . '.php';
    }

    public function tarifas(): ResponseInterface
    {
        return $this->view->render('pages/tarifas.tpl', new Meta(
            title: 'Tarifas',
            canonical: '/tarifas',
            description: 'Consulte as tarifas do transporte público do Distrito Federal e das Cidades do Entorno.',
        ));
    }

    /** /tarifas/distrito-federal (alias: /pages/tarifas-distrito-federal). */
    public function tarifasDf(): ResponseInterface
    {
        $dados = $this->dados('tarifas')['df'];

        return $this->view->render('pages/tarifas-df.tpl', new Meta(
            title: 'Tarifas — Distrito Federal',
            canonical: '/tarifas/distrito-federal',
            description: 'Valores das tarifas do transporte público no Distrito Federal.',
        ), $dados);
    }

    /** /tarifas/cidades-entorno (alias: /pages/tarifas-entorno). */
    public function tarifasEntorno(): ResponseInterface
    {
        $dados = $this->dados('tarifas')['entorno'];

        return $this->view->render('pages/tarifas-entorno.tpl', new Meta(
            title: 'Tarifas — Cidades do Entorno',
            canonical: '/tarifas/cidades-entorno',
            description: 'Valores das tarifas do transporte nas Cidades do Entorno.',
        ), $dados);
    }

    /** /achados-e-perdidos (alias: /pages/achados-e-perdidos). */
    public function achados(): ResponseInterface
    {
        return $this->view->render('pages/achados.tpl', new Meta(
            title: 'Achados e Perdidos',
            canonical: '/achados-e-perdidos',
            description: 'Contatos das operadoras de ônibus do DF para recuperar itens perdidos no transporte público.',
        ), $this->dados('achados'));
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controller;

use App\Api\ApiIndisponivelException;
use App\Api\BusRepository;
use App\Http\NotFoundException;
use App\View\Meta;
use App\View\View;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

/** Cidades: listagem e linhas por cidade (aliases /city e /city/{slug}). */
final class CidadeController
{
    public function __construct(
        private readonly BusRepository $repo,
        private readonly View $view,
    ) {
    }

    /** GET /cidades (e alias /city). */
    public function lista(): ResponseInterface
    {
        try {
            $cidades = $this->repo->cidades();
            $erro = false;
        } catch (ApiIndisponivelException) {
            $cidades = [];
            $erro = true;
        }

        return $this->view->render('pages/cidades.tpl', new Meta(
            title: 'Cidades',
            canonical: '/cidades',
            description: 'Lista de cidades do Distrito Federal e Entorno com linhas de ônibus disponíveis.',
        ), ['cidades' => $cidades, 'erro' => $erro]);
    }

    /** GET /cidades/{slug} (e alias /city/{slug}). */
    public function detalhe(ServerRequestInterface $request, array $args): ResponseInterface
    {
        $slug = (string) $args['slug'];

        $cidade = $this->repo->cidade($slug)
            ?? throw new NotFoundException('Cidade não encontrada');

        return $this->view->render('pages/cidade.tpl', new Meta(
            title: 'Linhas em ' . $cidade->nome,
            canonical: '/cidades/' . $slug,
            description: 'Horários e linhas de ônibus disponíveis em ' . $cidade->nome . '.',
        ), [
            'cidade' => $cidade,
            'linhas' => $this->repo->linhas($slug),
        ]);
    }
}

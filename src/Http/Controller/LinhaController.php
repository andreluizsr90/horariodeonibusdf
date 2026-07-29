<?php

declare(strict_types=1);

namespace App\Http\Controller;

use App\Api\ApiIndisponivelException;
use App\Api\BusRepository;
use App\Domain\Linha;
use App\Http\NotFoundException;
use App\View\Meta;
use App\View\View;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Home, listagem/busca de linhas, detalhe e localização em tempo real.
 *
 * Regra de canonical: as rotas ALIAS (/travel/{slug}, /linha/{slug}/…,
 * /travel/live/{slug}) usam exatamente o mesmo canonical da rota principal.
 */
final class LinhaController
{
    private const LINHAS_NA_HOME = 50;

    public function __construct(
        private readonly BusRepository $repo,
        private readonly View $view,
    ) {
    }

    /** GET / — 50 linhas aleatórias + busca. Canonical: "/". */
    public function home(): ResponseInterface
    {
        try {
            $todas = $this->repo->linhas();
            $erro = false;
        } catch (ApiIndisponivelException) {
            $todas = [];
            $erro = true;
        }

        $amostra = $todas;
        shuffle($amostra);
        $amostra = array_slice($amostra, 0, self::LINHAS_NA_HOME);

        return $this->view->render('pages/home.tpl', new Meta(
            title: 'Horários de Ônibus do DF e Entorno',
            canonical: '/',
        ), [
            'linhas' => $amostra,
            'total' => count($todas),
            'status' => sprintf('Exibindo %d de %d linhas', count($amostra), count($todas)),
            'erro' => $erro,
        ]);
    }

    /**
     * GET /linhas[?q=…] — todas as linhas ou o resultado da busca.
     * Canonical aponta para a HOME, conforme a convenção do projeto.
     */
    public function lista(ServerRequestInterface $request): ResponseInterface
    {
        $q = trim((string) ($request->getQueryParams()['q'] ?? ''));

        try {
            $linhas = $this->repo->linhas();
            $erro = false;
        } catch (ApiIndisponivelException) {
            $linhas = [];
            $erro = true;
        }

        if ($q !== '') {
            $linhas = $this->filtrar($linhas, $q);
        }

        $total = count($linhas);
        $status = $q !== ''
            ? sprintf('%d resultado%s para “%s”', $total, $total === 1 ? '' : 's', $q)
            : sprintf('%d linhas disponíveis', $total);

        return $this->view->render('pages/linhas.tpl', new Meta(
            title: $q !== '' ? 'Busca: ' . $q : 'Todas as linhas',
            canonical: '/',
            description: 'Lista completa de linhas de ônibus do Distrito Federal e Entorno.',
            // Páginas de resultado de busca não devem ser indexadas.
            noindex: $q !== '',
        ), [
            'linhas' => $linhas,
            'q' => $q,
            'status' => $status,
            'erro' => $erro,
        ]);
    }

    /** GET /linhas/{slug} (e alias /travel/{slug}). */
    public function detalhe(ServerRequestInterface $request, array $args): ResponseInterface
    {
        $slug = (string) $args['slug'];
        $linha = $this->repo->detalhe($slug)
            ?? throw new NotFoundException('Linha não encontrada');

        return $this->view->render('pages/linha.tpl', new Meta(
            title: $linha->titulo(),
            canonical: '/linhas/' . $slug,
            description: 'Horários, itinerário e informações da ' . $linha->titulo() . '.'
                . ($linha->trajeto() !== null ? ' Trajeto: ' . $linha->trajeto() . '.' : ''),
        ), ['linha' => $linha]);
    }

    /**
     * GET /linhas/{slug}/localizacao — GPS em tempo real.
     * Aliases: /linha/{slug}/localizacao e /travel/live/{slug}.
     */
    public function localizacao(ServerRequestInterface $request, array $args): ResponseInterface
    {
        $slug = (string) $args['slug'];
        $linha = $this->repo->detalhe($slug)
            ?? throw new NotFoundException('Linha não encontrada');

        return $this->view->render('pages/localizacao.tpl', new Meta(
            title: 'Localização em tempo real — ' . $linha->titulo(),
            canonical: '/linhas/' . $slug . '/localizacao',
            description: 'Acompanhe no mapa, em tempo real, a posição dos ônibus da ' . $linha->titulo() . '.',
            // Conteúdo volátil: não é alvo de indexação.
            noindex: true,
        ), [
            'linha' => $linha,
            'titulo_pagina' => 'Ônibus em tempo real — '
                . ($linha->numero !== '' ? 'Linha ' . $linha->numero : $linha->nome),
            'descricao_pagina' => $linha->trajeto()
                ?? 'Posição atual dos veículos sobre o traçado da linha.',
            'percurso_json' => $linha->percurso?->toArray(),
            'crumbs' => [
                ['label' => 'Início', 'href' => '/'],
                ['label' => 'Linhas', 'href' => '/linhas'],
                ['label' => $linha->numero !== '' ? $linha->numero : $linha->nome, 'href' => '/linhas/' . $slug],
                ['label' => 'Tempo real'],
            ],
        ]);
    }

    /**
     * GET /favoritos?slugs=a,b,c — fragmento HTML com os cards favoritos.
     *
     * Existe porque o servidor não conhece o localStorage do usuário: o JS
     * envia os slugs salvos e recebe o HTML pronto, renderizado pelo MESMO
     * template dos demais cards (sem duplicar markup em JavaScript).
     */
    public function favoritos(ServerRequestInterface $request): ResponseInterface
    {
        $slugs = array_values(array_filter(
            array_map(trim(...), explode(',', (string) ($request->getQueryParams()['slugs'] ?? ''))),
        ));

        if ($slugs === []) {
            return $this->view->renderFragmento('partials/favoritos.tpl', ['linhas' => []]);
        }

        // Limite defensivo: evita uma query gigante via URL.
        $slugs = array_slice($slugs, 0, 60);

        try {
            $porSlug = [];
            foreach ($this->repo->linhas() as $linha) {
                $porSlug[$linha->slug] = $linha;
            }
        } catch (ApiIndisponivelException) {
            $porSlug = [];
        }

        // Preserva a ordem em que o usuário favoritou.
        $linhas = array_values(array_filter(array_map(
            static fn (string $slug): ?Linha => $porSlug[$slug] ?? null,
            $slugs,
        )));

        return $this->view->renderFragmento('partials/favoritos.tpl', ['linhas' => $linhas]);
    }

    /**
     * Busca por número, nome, origem ou destino (sem acento, sem caixa).
     *
     * @param list<Linha> $linhas
     * @return list<Linha>
     */
    private function filtrar(array $linhas, string $termo): array
    {
        $normalizar = static function (string $texto): string {
            $texto = mb_strtolower($texto, 'UTF-8');

            if (class_exists(\Normalizer::class)) {
                $texto = \Normalizer::normalize($texto, \Normalizer::FORM_D) ?: $texto;
                $texto = (string) preg_replace('/\p{Mn}+/u', '', $texto);
            }

            return $texto;
        };

        $alvo = $normalizar($termo);

        return array_values(array_filter($linhas, static function (Linha $l) use ($alvo, $normalizar): bool {
            $campos = $normalizar(implode(' ', array_filter([
                $l->numero, $l->nome, $l->origem, $l->destino,
            ])));

            return str_contains($campos, $alvo);
        }));
    }
}

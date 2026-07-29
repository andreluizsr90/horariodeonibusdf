<?php

declare(strict_types=1);

namespace App;

use App\Api\ApiIndisponivelException;
use App\Api\BusApiClient;
use App\Api\BusRepository;
use App\Api\TokenStore;
use App\Http\Controller\CidadeController;
use App\Http\Controller\LinhaController;
use App\Http\Controller\PaginaController;
use App\Http\Controller\SeoController;
use App\Http\NotFoundException;
use App\Support\Config;
use App\View\Meta;
use App\View\View;
use Laminas\Diactoros\ServerRequestFactory;
use League\Route\Http\Exception\NotFoundException as RouteNotFoundException;
use League\Route\Router;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Throwable;

/**
 * Núcleo da aplicação: monta as dependências, registra as rotas e despacha
 * a requisição.
 *
 * Convenção de rotas: cada rota ALIAS aponta para o MESMO handler da rota
 * principal — o canonical (definido no controller) é o que consolida o SEO.
 */
final class Kernel
{
    private Router $router;
    private View $view;

    public function __construct(private readonly string $rootDir)
    {
        $config = Config::load($rootDir);

        $this->view = new View($config, $rootDir . '/templates');

        $repo = new BusRepository(new BusApiClient(
            $config,
            new TokenStore($config->cacheDir . '/token.json', $config->apiRefreshSkew),
        ));

        $linhas = new LinhaController($repo, $this->view);
        $cidades = new CidadeController($repo, $this->view);
        $paginas = new PaginaController($this->view, $rootDir . '/data');
        $seo = new SeoController($repo, $config);

        $this->router = new Router();

        // ---- Home -------------------------------------------------------
        $this->router->get('/', [$linhas, 'home']);

        // ---- SEO / PWA ---------------------------------------------------
        $this->router->get('/sitemap.xml', [$seo, 'sitemap']);
        $this->router->get('/robots.txt', [$seo, 'robots']);
        $this->router->get('/manifest.webmanifest', [$seo, 'manifest']);

        // ---- Linhas ------------------------------------------------------
        $this->router->get('/linhas', [$linhas, 'lista']);
        // Fragmento HTML dos favoritos (o JS envia os slugs do localStorage).
        $this->router->get('/favoritos', [$linhas, 'favoritos']);
        // Localização em tempo real: principal + 2 aliases.
        $this->router->get('/linhas/{slug}/localizacao', [$linhas, 'localizacao']);
        $this->router->get('/linha/{slug}/localizacao', [$linhas, 'localizacao']);
        $this->router->get('/travel/live/{slug}', [$linhas, 'localizacao']);
        // Detalhe: principal + alias.
        $this->router->get('/linhas/{slug}', [$linhas, 'detalhe']);
        $this->router->get('/travel/{slug}', [$linhas, 'detalhe']);

        // ---- Cidades -----------------------------------------------------
        $this->router->get('/cidades', [$cidades, 'lista']);
        $this->router->get('/city', [$cidades, 'lista']);            // alias
        $this->router->get('/cidades/{slug}', [$cidades, 'detalhe']);
        $this->router->get('/city/{slug}', [$cidades, 'detalhe']);   // alias

        // ---- Tarifas -----------------------------------------------------
        $this->router->get('/tarifas', [$paginas, 'tarifas']);
        $this->router->get('/tarifas/distrito-federal', [$paginas, 'tarifasDf']);
        $this->router->get('/tarifas/cidades-entorno', [$paginas, 'tarifasEntorno']);
        $this->router->get('/pages/tarifas-distrito-federal', [$paginas, 'tarifasDf']);   // alias
        $this->router->get('/pages/tarifas-entorno', [$paginas, 'tarifasEntorno']);       // alias

        // ---- Achados e Perdidos ------------------------------------------
        $this->router->get('/achados-e-perdidos', [$paginas, 'achados']);
        $this->router->get('/pages/achados-e-perdidos', [$paginas, 'achados']);           // alias
    }

    public function handle(?ServerRequestInterface $request = null): ResponseInterface
    {
        $request ??= ServerRequestFactory::fromGlobals();

        try {
            return $this->router->dispatch($request);
        } catch (RouteNotFoundException | NotFoundException $e) {
            return $this->paginaErro(
                404,
                $e instanceof NotFoundException ? $e->getMessage() : 'Página não encontrada',
                'O conteúdo que você procura não existe ou foi movido.',
            );
        } catch (ApiIndisponivelException) {
            return $this->paginaErro(
                503,
                'Serviço temporariamente indisponível',
                'Não conseguimos falar com o serviço de dados agora. Tente novamente em instantes.',
            );
        } catch (Throwable $e) {
            if (Config::get()->debug) {
                throw $e;
            }

            return $this->paginaErro(
                500,
                'Algo deu errado',
                'Ocorreu um erro inesperado ao carregar esta página.',
            );
        }
    }

    private function paginaErro(int $codigo, string $titulo, string $mensagem): ResponseInterface
    {
        return $this->view->render(
            'pages/erro.tpl',
            new Meta(title: $titulo, canonical: '/', noindex: true),
            ['codigo' => $codigo, 'titulo' => $titulo, 'mensagem' => $mensagem],
            $codigo,
        );
    }
}

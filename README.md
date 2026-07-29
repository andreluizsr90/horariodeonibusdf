# Horário de Ônibus DF

Portal de horários, linhas e itinerários de ônibus do Distrito Federal e Entorno.
**PHP 8.4+ puro** com Composer — sem framework full-stack, apenas bibliotecas
focadas.

> Versões anteriores (Next.js e Trongate) permanecem no histórico do Git.

## Stack

| Papel        | Biblioteca                    | Por quê                                        |
| ------------ | ----------------------------- | ---------------------------------------------- |
| Rotas        | `league/route`                | PSR-7/PSR-15, ativo, sem deprecations no 8.5   |
| Templates    | `fenom/fenom`                 | Rápido, compilado, **auto-escape** por padrão   |
| HTTP/API     | `guzzlehttp/guzzle`           | Middleware resolve Bearer + retry 401           |
| PSR-7        | `laminas/laminas-diactoros`   | Implementação de request/response               |
| SSL          | `composer/ca-bundle`          | CA bundle gerenciado (funciona em qualquer SO)  |
| Env          | `vlucas/phpdotenv`            | Leitura do `.env`                               |

## Estrutura

```
src/
├── Domain/       # DTOs TIPADOS: Linha, LinhaDetalhe, Cidade, Sentido, Horario, Percurso
├── Api/          # BusApiClient (Guzzle), TokenStore, BusRepository (anti-corruption layer)
├── Http/         # Controllers
├── View/         # View (Fenom) + Meta (SEO)
├── Support/      # Config, Slug
└── Kernel.php    # Monta dependências, registra rotas, despacha

templates/        # .tpl (layout, partials reutilizáveis, páginas)
data/             # Dados estáticos (tarifas, achados e perdidos)
public/           # Front controller + assets (CSS compilado, JS, imagens)
build/            # Fontes do Tailwind (dev) — NÃO vai para produção
docker/           # Config do nginx
```

## Integração com a API

Isolada em `src/Api/`:

1. **Token cacheado em arquivo** (`TokenStore`), compartilhado entre requisições.
2. **Renovação automática** dentro da janela de `API_TOKEN_REFRESH_SKEW_SECONDS`.
3. **Bearer via middleware** do Guzzle — nenhuma chamada precisa lembrar do header.
4. **Retry único em 401** — invalida o token, reautentica e repete.
5. `BusRepository` traduz o JSON bruto em **objetos tipados** — o resto da
   aplicação nunca vê arrays soltos.

## Rotas e canonical

Rotas *alias* renderizam o mesmo conteúdo, mas o `<link rel="canonical">`
sempre aponta para a **rota principal**:

| Principal (canonical)        | Alias                                              |
| ---------------------------- | -------------------------------------------------- |
| `/`                          | `/linhas` (canonical → `/`)                        |
| `/cidades`                   | `/city`                                            |
| `/cidades/{slug}`            | `/city/{slug}`                                     |
| `/linhas/{slug}`             | `/travel/{slug}`                                   |
| `/linhas/{slug}/localizacao` | `/linha/{slug}/localizacao`, `/travel/live/{slug}` |
| `/tarifas/distrito-federal`  | `/pages/tarifas-distrito-federal`                  |
| `/tarifas/cidades-entorno`   | `/pages/tarifas-entorno`                           |
| `/achados-e-perdidos`        | `/pages/achados-e-perdidos`                        |

Mais `/sitemap.xml` (só URLs canônicas), `/robots.txt` e `/manifest.webmanifest`.

## Renderização e progressive enhancement

O HTML sai **completo do servidor** — os cards de linha são indexáveis pelos
buscadores. O JavaScript apenas enriquece:

- **Busca**: é um `<form>` GET real (`/linhas?q=…`) processado no servidor.
  Funciona sem JS; com JS, filtra os cards visíveis instantaneamente.
- **Favoritos**: os slugs ficam no `localStorage`; o HTML dos cards vem de
  `/favoritos?slugs=…`, renderizado pelo **mesmo template** das listagens —
  sem markup duplicado em JavaScript.
- **Mapas** (Leaflet) e **GPS em tempo real** carregam sob demanda.

## Configuração (`.env`)

| Variável                         | Descrição                                |
| -------------------------------- | ---------------------------------------- |
| `API_BASE_URL`                   | URL base da API externa                  |
| `API_EMAIL` / `API_PASSWORD`     | Credenciais de `POST /api/auth`          |
| `API_TOKEN_REFRESH_SKEW_SECONDS` | Antecedência de renovação (**use `60`**) |
| `SITE_URL`                       | URL canônica pública                     |
| `GA_ID` / `ADSENSE_CLIENT`       | Tracking (opcionais)                     |
| `APP_ENV`                        | `dev` mostra exceções e recompila views  |
| `CACHE_DIR`                      | Cache de templates (padrão: temp do SO)  |

## Desenvolvimento

```bash
composer install
php -S localhost:8080 -t public public/router.php
```

Ao alterar estilos, regenere o CSS (Node é ferramenta de build, **não**
dependência de runtime):

```bash
npx tailwindcss@3 -c build/tailwind.config.js -i build/input.css -o public/assets/css/app.css --minify
```

## Produção (Docker)

```bash
docker compose up --build
```

Baseado em `trafex/php-nginx` (Alpine + nginx + PHP-FPM), rodando como usuário
**não-root**. O site fica em <http://localhost:3000>.

O `.env` é montado como volume — as credenciais **não entram na imagem**. A
raiz web é `public/`, então `src/`, `templates/`, `data/` e `vendor/` são
inacessíveis pelo navegador.

## Notas

- **GPS em tempo real**: o navegador consome o feed do DFTrans diretamente; o
  serviço é geobloqueado (responde apenas do Brasil).
- **Cache busting**: CSS e JS são servidos com `?v=mtime`, então publicar uma
  nova versão invalida o cache do navegador e do service worker.

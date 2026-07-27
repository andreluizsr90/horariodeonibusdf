# Horário de Ônibus DF — Trongate (PHP)

Portal de consulta de horários, linhas e itinerários de ônibus do Distrito
Federal e Entorno. Construído sobre o
[Trongate Framework](https://github.com/trongate/trongate-framework) (PHP MVC).

> Esta é a versão PHP/Trongate. A versão anterior em Next.js/React permanece
> disponível no histórico do Git (branch `main`).

## Arquitetura

```
config/
├── config.php          # constantes (BASE_URL, SITE_URL, API_*, GA/AdSense)
├── env.php             # leitor do .env (compartilhado com a versão antiga)
├── custom_routing.php  # rotas principais + aliases
└── cacert.pem          # CA bundle (SSL do cURL em qualquer ambiente)

modules/
├── busapi/             # cliente da API externa (auth+cache, retry 401, DTOs)
├── home/               # página inicial
├── linhas/             # listagem, detalhe e localização em tempo real (GPS)
├── cidades/            # listagem de cidades e linhas por cidade
├── tarifas/            # tarifas DF e Entorno (+ dados estáticos)
├── achados/            # achados e perdidos (+ dados estáticos)
├── seo/                # sitemap.xml e robots.txt dinâmicos
└── templates/views/public.php   # layout global (header, anúncios, footer, SEO)

public/
├── assets/js/site.js   # favoritos, busca, itinerário, mapas (JS puro)
├── assets/img/         # logos
└── router.php          # front controller p/ o servidor embutido do PHP (dev)
```

**Fluxo:** rota → controller (`modules/X/X.php`) → `$this->templates->public($data)`
→ layout global renderiza a view (`modules/X/views/*.php`).

Os dados vêm 100% da API externa — **não há banco de dados** (o ORM do
Trongate não é usado).

## Rotas e canonical

Rotas *alias* renderizam o mesmo conteúdo da principal, mas o
`<link rel="canonical">` sempre aponta para a **rota principal**:

| Principal (canonical)            | Alias                                            |
| -------------------------------- | ------------------------------------------------ |
| `/`                              | `/linhas` (canonical → `/`)                      |
| `/cidades`                       | `/city`                                          |
| `/cidades/{slug}`                | `/city/{slug}`                                   |
| `/linhas/{slug}`                 | `/travel/{slug}`                                 |
| `/linhas/{slug}/localizacao`     | `/linha/{slug}/localizacao`, `/travel/live/{slug}` |
| `/tarifas/distrito-federal`      | `/pages/tarifas-distrito-federal`                |
| `/tarifas/cidades-entorno`       | `/pages/tarifas-entorno`                         |
| `/achados-e-perdidos`            | `/pages/achados-e-perdidos`                      |

Há ainda `/sitemap.xml` (somente URLs canônicas) e `/robots.txt` dinâmicos.

## Integração com a API

Isolada em `modules/busapi/Busapi.php`:

1. **Cache do token em arquivo** (compartilhado entre requisições PHP).
2. **Renovação automática** quando falta menos que `API_TOKEN_REFRESH_SKEW_SECONDS`.
3. **Retry único em 401** — reautentica e repete a chamada.
4. `Authorization: Bearer {token}` em todas as chamadas `/api/onibus/*`.

## Configuração (`.env` na raiz)

| Variável                         | Descrição                                |
| -------------------------------- | ---------------------------------------- |
| `API_BASE_URL`                   | URL base da API externa                  |
| `API_EMAIL` / `API_PASSWORD`     | Credenciais de `POST /api/auth`          |
| `API_TOKEN_REFRESH_SKEW_SECONDS` | Antecedência de renovação (**use `60`**) |
| `NEXT_PUBLIC_SITE_URL`           | URL canônica pública (ou `SITE_URL`)     |
| `NEXT_PUBLIC_GA_ID`              | Google Analytics 4 (opcional)            |
| `NEXT_PUBLIC_ADSENSE_CLIENT`     | Google AdSense (opcional)                |

## Desenvolvimento

```bash
php -S localhost:8080 -t public public/router.php
```

## Produção (Docker)

```bash
docker compose up --build
```

Baseado em [`trafex/php-nginx:latest`](https://hub.docker.com/r/trafex/php-nginx)
(Alpine + nginx + PHP-FPM 8.5), rodando como usuário **não-root** (`nobody`).
O site fica em <http://localhost:3000> (a imagem escuta na 8080 internamente).

O `.env` é montado como volume — as credenciais **não entram na imagem**.

Como a imagem usa nginx, os arquivos `.htaccess` (Apache) não têm efeito: as
regras equivalentes estão em [`docker/nginx-default.conf`](docker/nginx-default.conf),
que também define `public/` como raiz do site — assim `config/`, `engine/` e
`modules/` ficam inacessíveis pela web.

## Pendências conhecidas

- **Tailwind via CDN** no layout (`Play CDN`). Para produção, gerar o CSS
  compilado e servir de `public/assets/css/`.
- **GPS em tempo real**: o navegador consome o feed do DFTrans diretamente;
  o serviço é geobloqueado (só responde do Brasil).

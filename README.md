# Horário de Ônibus DF

Portal de consulta de horários, linhas e itinerários de ônibus do Distrito
Federal e Entorno. Construído com **Next.js (App Router)**, **React**,
**TypeScript** e **Tailwind CSS**, seguindo princípios de **Clean Architecture**
para separar a camada de UI da lógica de consumo da API.

## Arquitetura (Clean Architecture)

O código é organizado em camadas com dependências apontando sempre para o núcleo:

```
src/
├── core/                      # Núcleo — sem dependências de framework
│   ├── domain/entities.ts     # Entidades: Cidade, Linha, LinhaDetalhe, Horario
│   └── ports/bus-repository.ts# Porta (interface) que a aplicação consome
│
├── application/               # Casos de uso
│   └── services/bus-service.ts
│
├── infrastructure/            # Detalhes técnicos (implementam as portas)
│   └── api/
│       ├── token-manager.ts   # Cache do token em memória + renovação
│       ├── http-client.ts     # GET autenticado + retry em 401
│       └── bus-api-repository.ts # Implementa BusRepository (HTTP + mapeamento)
│
├── components/                # Camada de UI (React)
│   ├── layout/                # Header, Footer, navegação
│   ├── ui/                    # Cards, busca, estados
│   ├── views/                 # Views compartilhadas entre rotas principais/alias
│   └── analytics/             # AdSense
│
├── lib/                       # Config, SEO/canonical, slug
└── app/                       # Rotas (App Router) + metadata/SEO
```

**Regra de dependência:** `app` → `components` → `application` → `core`.
A `infrastructure` implementa as interfaces de `core` e é injetada na
`application`. A UI nunca fala HTTP diretamente.

## Autenticação inteligente com a API

O fluxo fica isolado em `infrastructure/api`:

1. **Cache em memória** do token (singleton por processo do servidor).
2. **Renovação automática:** antes de cada chamada, se o token expira em menos
   de 1 minuto (`API_TOKEN_REFRESH_SKEW_SECONDS`), reautentica.
3. **Retry em 401:** se uma requisição retornar `401`, força **uma**
   reautenticação e repete a chamada original.
4. **Controle de concorrência:** requisições simultâneas compartilham a mesma
   promessa de autenticação (evita "tempestade" de logins).

Todas as chamadas a `/api/onibus/*` recebem o header `Authorization: Bearer {token}`.

## SEO e Canonical

Cada página define seu `<link rel="canonical">` via **Metadata API**
(`alternates.canonical`). Rotas **alias** renderizam o mesmo conteúdo da
principal, mas apontam canonicamente para ela:

| Rota principal (canonical)      | Alias                               |
| ------------------------------- | ----------------------------------- |
| `/`                             | `/linhas` (canonical → `/`)         |
| `/cidades`                      | `/city`                             |
| `/cidades/{slug}`               | `/city/{slug}`                      |
| `/linhas/{slug}`                | `/travel/{slug}`                    |
| `/tarifas/distrito-federal`     | `/pages/tarifas-distrito-federal`   |
| `/tarifas/cidades-entorno`      | `/pages/tarifas-entorno`            |
| `/achados-e-perdidos`           | `/pages/achados-e-perdidos`         |

Há também `sitemap.xml` (só rotas canônicas) e `robots.txt` dinâmicos.

## Configuração

Copie `.env.example` para `.env.local` (desenvolvimento) ou `.env` (Docker) e
preencha:

| Variável                         | Descrição                                   |
| -------------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | URL pública canônica (sem barra final)      |
| `API_BASE_URL`                   | URL base da API externa                     |
| `API_EMAIL` / `API_PASSWORD`     | Credenciais do endpoint `POST /api/auth`    |
| `API_TOKEN_REFRESH_SKEW_SECONDS` | Antecedência de renovação (padrão 60)       |
| `NEXT_PUBLIC_GA_ID`              | ID do Google Analytics 4 (opcional)         |
| `NEXT_PUBLIC_ADSENSE_CLIENT`     | ID do Google AdSense (opcional)             |

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
```

## Produção com Docker

```bash
cp .env.example .env         # preencha as variáveis
docker compose up --build    # expõe a porta 3000
```

O `Dockerfile` é multi-stage e usa o build **standalone** do Next.js,
resultando em uma imagem enxuta que roda como usuário não-root.

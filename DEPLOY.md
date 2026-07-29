# Deploy em produção

## 0. Antes do primeiro deploy (obrigatório)

### 0.1 Remover o `.env` do histórico do Git

O arquivo `.env` **com as credenciais reais da API** foi commitado em
`19f1f6c`. Esse commit **ainda não foi enviado** ao GitHub — corrija antes de
qualquer `git push`.

Já feito no repositório:

- `.gitignore` agora ignora `.env` e `vendor/`
- `.env` removido do índice (o arquivo local segue intacto)

Falta limpar o histórico. Como o commit não foi publicado, basta reescrever
localmente:

```bash
git rebase -i 19f1f6c^
```

Marque `19f1f6c` como `edit`, e então:

```bash
git rm --cached .env
git commit --amend --no-edit
git rebase --continue
```

Confirme que sumiu:

```bash
git log --all --oneline -- .env
```

> Se o commit **já tiver sido publicado** em algum momento, considere as
> credenciais comprometidas: troque a senha da API e use
> `git filter-repo --path .env --invert-paths` para expurgar o histórico.

### 0.2 Ajustar o `.env` de produção

| Variável                         | Valor em produção                        |
| -------------------------------- | ---------------------------------------- |
| `APP_ENV`                        | `prod` — sem isso, exceções vazam na tela |
| `SITE_URL`                       | `https://www.horariodeonibusdf.com.br`   |
| `API_TOKEN_REFRESH_SKEW_SECONDS` | `60` — **hoje está `86400`**, o que força reautenticação a **cada requisição** |
| `API_BASE_URL`, `API_EMAIL`, `API_PASSWORD` | credenciais da API              |
| `GA_ID`, `ADSENSE_CLIENT`        | tracking                                  |

`SITE_URL` é o que monta `<link rel="canonical">`, Open Graph e o
`sitemap.xml`. Se ficar errado, o SEO do site inteiro sai errado.

### 0.3 Regerar o CSS se tiver mexido em estilos

Não há Node em produção — o CSS compilado é versionado:

```bash
npx tailwindcss@3 -c build/tailwind.config.js -i build/input.css -o public/assets/css/app.css --minify
git add public/assets/css/app.css
```

---

## 1. Deploy com Docker (recomendado)

### 1.1 No servidor

```bash
git clone git@github.com:andreluizsr90/horariodeonibusdf.git
cd horariodeonibusdf
```

Crie o `.env` **no servidor** (nunca versionado):

```bash
cp .env.example .env
nano .env          # preencha conforme a seção 0.2
chmod 600 .env
```

### 1.2 Subir

```bash
docker compose up -d --build
```

Isso publica em `http://<servidor>:3000` (o container escuta 8080
internamente, como usuário não-root).

### 1.3 Verificar

```bash
docker compose ps                     # deve ficar "healthy"
curl -I http://localhost:3000/
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/ | grep -o '<link rel="canonical"[^>]*>'
```

O `canonical` precisa mostrar o domínio real — se aparecer `localhost`,
o `SITE_URL` está errado.

---

## 2. HTTPS (proxy reverso)

A imagem serve **HTTP puro**. Coloque um proxy na frente para TLS. Exemplo com
Caddy (certificado Let's Encrypt automático):

`/etc/caddy/Caddyfile`:

```
www.horariodeonibusdf.com.br {
    reverse_proxy localhost:3000
}

horariodeonibusdf.com.br {
    redir https://www.horariodeonibusdf.com.br{uri} permanent
}
```

Redirecionar o domínio sem `www` para o `www` é importante: o `canonical`
aponta para `www`, e servir os dois sem redirect gera conteúdo duplicado.

---

## 3. Atualizações

```bash
git pull
docker compose up -d --build
```

O build reinstala as dependências (`composer install --no-dev`) a partir do
`composer.lock`. Os assets carregam `?v=mtime`, então CSS/JS novos invalidam
o cache do navegador e do service worker automaticamente.

---

## 4. Alternativa: hospedagem PHP sem Docker

Requisitos: **PHP 8.4+** com `curl`, `mbstring` e `json`.

```bash
composer install --no-dev --optimize-autoloader
```

Aponte o **DocumentRoot para `public/`**. Isso não é opcional: é o que mantém
`src/`, `templates/`, `data/`, `vendor/` e o `.env` fora do alcance do
navegador.

- **nginx**: use `docker/nginx-default.conf` como base (ajuste `root` e o
  socket do PHP-FPM).
- **Apache**: habilite `mod_rewrite` e crie `public/.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

O diretório de cache de templates precisa ser gravável pelo usuário do
PHP (padrão: temp do sistema; ou defina `CACHE_DIR`).

---

## 5. Checklist final

- [ ] `.env` fora do histórico do Git e presente **apenas** no servidor
- [ ] `APP_ENV=prod`
- [ ] `API_TOKEN_REFRESH_SKEW_SECONDS=60`
- [ ] `SITE_URL` com o domínio real
- [ ] DocumentRoot em `public/`
- [ ] HTTPS ativo + redirect de não-www para www
- [ ] `docker compose ps` mostrando `healthy`
- [ ] `canonical` da home com o domínio correto
- [ ] `/sitemap.xml` respondendo com as URLs de linhas e cidades
- [ ] Sitemap enviado no Google Search Console

## 6. Observações

- **GPS em tempo real**: o navegador do usuário consome o feed do DFTrans
  diretamente. O serviço é geobloqueado (só responde do Brasil) — funciona
  para o público-alvo, mas não em testes fora do país.
- **AdSense**: só preenche anúncios em domínio aprovado, nunca em `localhost`.
- **Backups**: o app é *stateless* — não há banco de dados. Basta versionar o
  código e guardar o `.env` em local seguro (cofre de senhas).

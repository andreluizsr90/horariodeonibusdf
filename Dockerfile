# =========================================================================
#  Horário de Ônibus DF — PHP puro sobre trafex/php-nginx
#  (Alpine + nginx + PHP-FPM, usuário não-root `nobody`, porta 8080)
# =========================================================================
FROM composer:2 AS deps
WORKDIR /app
COPY composer.json composer.lock* ./
# Instala só as dependências de produção, com autoloader otimizado.
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

FROM trafex/php-nginx:latest

# Config do nginx do projeto (raiz em public/, rotas dinâmicas preservadas).
COPY docker/nginx-default.conf /etc/nginx/conf.d/default.conf

# Código da aplicação + dependências resolvidas no estágio anterior.
COPY --chown=nobody . /var/www/html/
COPY --from=deps --chown=nobody /app/vendor /var/www/html/vendor

# O Fenom compila templates em runtime: o diretório de cache precisa existir
# e ser gravável pelo usuário `nobody` (o projeto em si é somente-leitura).
RUN mkdir -p /tmp/honibusdf-cache && chown -R nobody /tmp/honibusdf-cache
ENV CACHE_DIR=/tmp/honibusdf-cache

# A imagem base já define USER nobody, EXPOSE 8080 e o supervisord como CMD.

# =========================================================================
#  Horário de Ônibus DF — Trongate (PHP) sobre trafex/php-nginx
#
#  Imagem Alpine enxuta com nginx + PHP-FPM já configurados, rodando como
#  usuário NÃO-root (nobody) e expondo a porta não privilegiada 8080.
# =========================================================================
FROM trafex/php-nginx:latest

# Config do nginx do projeto: raiz em public/ e rotas dinâmicas preservadas
# (substitui o papel dos arquivos .htaccess, que são do Apache).
COPY docker/nginx-default.conf /etc/nginx/conf.d/default.conf

# Código da aplicação. O usuário `nobody` (da imagem) precisa apenas LER —
# a aplicação não escreve no diretório do projeto.
COPY --chown=nobody . /var/www/html/

# O .env NÃO entra na imagem (ver .dockerignore); é montado em runtime pelo
# docker-compose, mantendo as credenciais fora do build.

# A imagem já define: USER nobody, EXPOSE 8080 e o supervisord como CMD.

# =========================================================================
#  Dockerfile multi-stage para Next.js (output: standalone)
# =========================================================================

# ---- Stage 1: dependências -----------------------------------------------
FROM node:22-alpine AS deps
# libc6-compat é recomendada pela documentação do Next em Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instala apenas as dependências, aproveitando o cache de camadas.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---- Stage 2: build ------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis públicas (NEXT_PUBLIC_*) são "inlined" no bundle DURANTE o build e
# ficam gravadas nas páginas estáticas (metadataBase → canonical/OG, GA, AdSense).
# Por isso PRECISAM existir aqui: passá-las só no runtime NÃO corrige o canonical
# das páginas pré-renderizadas (que sairiam com http://localhost:3000).
# As variáveis PRIVADAS da API (API_*) NÃO entram no build — são lidas só em runtime.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_ADSENSE_CLIENT
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID} \
    NEXT_PUBLIC_ADSENSE_CLIENT=${NEXT_PUBLIC_ADSENSE_CLIENT} \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 3: runtime ----------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuário não-root por segurança.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copia os artefatos do build standalone (mínimos para rodar).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# server.js é gerado pelo output "standalone".
CMD ["node", "server.js"]

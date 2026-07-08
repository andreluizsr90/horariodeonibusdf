/**
 * Configuração centralizada da aplicação.
 *
 * Lê variáveis de ambiente uma única vez e as expõe de forma tipada.
 * Variáveis sensíveis (credenciais/URL da API) NUNCA são prefixadas com
 * NEXT_PUBLIC_, garantindo que só existam no runtime do servidor.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    // Em build/CI a variável pode não existir; falhamos apenas em runtime
    // quando a API for de fato consumida (ver http-client).
    return "";
  }
  return value.replace(/\/+$/, ""); // remove barras finais
}

export const config = {
  site: {
    /** URL pública canônica, sem barra final. */
    url:
      (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
        /\/+$/,
        "",
      ),
    name: "Horário de Ônibus DF",
    shortName: "Ônibus DF",
    description:
      "Consulte horários, itinerários e linhas de ônibus do Distrito Federal e Entorno de forma rápida e gratuita.",
  },

  api: {
    baseUrl: required("API_BASE_URL", process.env.API_BASE_URL),
    email: process.env.API_EMAIL ?? "",
    password: process.env.API_PASSWORD ?? "",
    /** Antecedência (ms) para renovar o token antes de expirar. */
    refreshSkewMs:
      (Number(process.env.API_TOKEN_REFRESH_SKEW_SECONDS) || 60) * 1000,
  },

  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
    adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
  },
} as const;

export type AppConfig = typeof config;

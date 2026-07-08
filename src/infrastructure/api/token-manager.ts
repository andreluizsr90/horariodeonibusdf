import "server-only";

import { config } from "@/lib/config";

/**
 * Gerenciador de token de autenticação (Bearer).
 *
 * Responsabilidades:
 *  - Fazer cache do token EM MEMÓRIA no servidor (singleton por processo).
 *  - Reautenticar automaticamente quando o token está prestes a expirar
 *    (dentro da janela de "skew", padrão 60s).
 *  - Evitar corrida de requisições: se várias chamadas precisarem do token
 *    ao mesmo tempo, todas aguardam a MESMA promessa de autenticação.
 *
 * Observação: em deploys com múltiplos workers/instâncias o cache é por
 * processo — o que é aceitável, pois cada processo simplesmente
 * autenticará uma vez e reutilizará seu próprio token.
 */

interface CachedToken {
  token: string;
  /** Timestamp (ms) absoluto de expiração. */
  expiresAtMs: number;
}

interface AuthPayload {
  token?: string;
  access_token?: string;
  expires_at?: string | number;
  expiresAt?: string | number;
}

/**
 * A API pode retornar o token no topo (`{ token, expires_at }`) ou
 * encapsulado (`{ success, data: { token, expires_at } }`). Suportamos ambos.
 */
interface AuthResponse extends AuthPayload {
  data?: AuthPayload;
}

// O `globalThis` garante que o singleton sobreviva ao hot-reload do Next
// em desenvolvimento (que reavalia os módulos).
const globalForToken = globalThis as unknown as {
  __busTokenCache?: CachedToken | null;
  __busAuthPromise?: Promise<CachedToken> | null;
};

function parseExpiresAt(raw: string | number): number {
  if (typeof raw === "number") {
    // Pode vir em segundos (epoch) ou ms — normaliza para ms.
    return raw < 1e12 ? raw * 1000 : raw;
  }
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) return parsed;
  // Fallback: token válido por 1 hora a partir de agora.
  return Date.now() + 60 * 60 * 1000;
}

async function authenticate(): Promise<CachedToken> {
  if (!config.api.baseUrl) {
    throw new Error(
      "API_BASE_URL não configurada. Defina as variáveis de ambiente da API.",
    );
  }

  const res = await fetch(`${config.api.baseUrl}/api/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: config.api.email,
      password: config.api.password,
    }),
    // A autenticação nunca deve ser cacheada pelo fetch do Next.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Falha na autenticação com a API (HTTP ${res.status}). ${text}`.trim(),
    );
  }

  const json = (await res.json()) as AuthResponse;
  // Desencapsula o envelope `{ data: {...} }` quando presente.
  const payload: AuthPayload = json?.data ?? json;
  const token = payload?.token ?? payload?.access_token;
  if (!token) {
    throw new Error("Resposta de autenticação inválida: token ausente.");
  }

  const rawExpires = payload.expires_at ?? payload.expiresAt;
  const cached: CachedToken = {
    token,
    expiresAtMs:
      rawExpires !== undefined && rawExpires !== null
        ? parseExpiresAt(rawExpires)
        : Date.now() + 60 * 60 * 1000, // fallback: 1 hora
  };
  globalForToken.__busTokenCache = cached;
  return cached;
}

function isExpiring(token: CachedToken): boolean {
  return Date.now() >= token.expiresAtMs - config.api.refreshSkewMs;
}

/**
 * Retorna um token válido, reautenticando se necessário.
 * Requisições concorrentes compartilham a mesma promessa de autenticação.
 */
export async function getValidToken(): Promise<string> {
  const cached = globalForToken.__busTokenCache;

  if (cached && !isExpiring(cached)) {
    return cached.token;
  }

  // Já existe uma autenticação em andamento? Aguarda ela.
  if (globalForToken.__busAuthPromise) {
    const result = await globalForToken.__busAuthPromise;
    return result.token;
  }

  const promise = authenticate().finally(() => {
    globalForToken.__busAuthPromise = null;
  });
  globalForToken.__busAuthPromise = promise;

  const result = await promise;
  return result.token;
}

/**
 * Força uma nova autenticação (usado quando a API responde 401 mesmo com
 * um token que parecia válido). Invalida o cache atual.
 */
export async function forceReauthenticate(): Promise<string> {
  globalForToken.__busTokenCache = null;

  if (globalForToken.__busAuthPromise) {
    const result = await globalForToken.__busAuthPromise;
    return result.token;
  }

  const promise = authenticate().finally(() => {
    globalForToken.__busAuthPromise = null;
  });
  globalForToken.__busAuthPromise = promise;

  const result = await promise;
  return result.token;
}

import "server-only";

import { config } from "@/lib/config";
import { forceReauthenticate, getValidToken } from "./token-manager";

/**
 * Cliente HTTP autenticado para a API de ônibus.
 *
 * - Injeta o header `Authorization: Bearer {token}` em toda requisição.
 * - Se a resposta for 401 (não autorizado), força UMA reautenticação e
 *   repete a chamada original exatamente uma vez.
 * - Aplica revalidação (ISR) configurável via `revalidateSeconds`.
 */

interface RequestOptions {
  /** Segundos de cache/revalidação do fetch do Next (ISR). Padrão: 300s. */
  revalidateSeconds?: number;
  /** Query params opcionais. */
  searchParams?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, searchParams?: RequestOptions["searchParams"]) {
  const url = new URL(
    path.startsWith("/") ? path : `/${path}`,
    config.api.baseUrl,
  );
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function doFetch(url: string, token: string, revalidate: number) {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate },
  });
}

/**
 * Executa um GET autenticado e retorna o JSON já tipado.
 * Lança erro em respostas não-OK (exceto o retry automático de 401).
 */
export async function apiGet<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (!config.api.baseUrl) {
    throw new Error(
      "API_BASE_URL não configurada. Defina as variáveis de ambiente da API.",
    );
  }

  const revalidate = options.revalidateSeconds ?? 300;
  const url = buildUrl(path, options.searchParams);

  let token = await getValidToken();
  let res = await doFetch(url, token, revalidate);

  // Retry único em caso de 401: força reautenticação e repete a chamada.
  if (res.status === 401) {
    token = await forceReauthenticate();
    res = await doFetch(url, token, revalidate);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Erro na requisição GET ${path} (HTTP ${res.status}). ${text}`.trim(),
    );
  }

  return (await res.json()) as T;
}

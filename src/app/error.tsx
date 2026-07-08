"use client";

import { useEffect } from "react";

/**
 * Error boundary global (App Router). Captura exceções de renderização das
 * rotas e oferece a opção de tentar novamente.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Em produção, envie para um serviço de observabilidade (Sentry, etc.).
    console.error(error);
  }, [error]);

  return (
    <section className="container-page py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        Algo deu errado
      </h1>
      <p className="mx-auto mt-2 max-w-md text-slate-600">
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Tentar novamente
      </button>
    </section>
  );
}

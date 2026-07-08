import Link from "next/link";
import type { Cidade } from "@/core/domain/entities";

/** Card de uma cidade, linkando para a listagem de linhas daquela cidade. */
export function CidadeCard({ cidade }: { cidade: Cidade }) {
  return (
    <Link
      href={`/cidades/${cidade.slug}`}
      className="card group flex items-center justify-between gap-3 p-5"
      aria-label={`Ver linhas de ${cidade.nome}`}
    >
      <span className="min-w-0">
        <span className="block truncate text-lg font-semibold text-slate-800 group-hover:text-brand-700">
          {cidade.nome}
        </span>
        <span className="mt-0.5 block text-sm text-slate-500">
          {cidade.totalLinhas !== undefined
            ? `${cidade.totalLinhas} linha${cidade.totalLinhas === 1 ? "" : "s"}`
            : "Ver linhas disponíveis"}
          {cidade.uf ? ` · ${cidade.uf}` : ""}
        </span>
      </span>
      <svg
        className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
}

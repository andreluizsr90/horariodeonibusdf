import Link from "next/link";
import type { Linha } from "@/core/domain/entities";

/** Card de uma linha de ônibus, com número em destaque e origem/destino. */
export function LinhaCard({ linha }: { linha: Linha }) {
  return (
    <Link
      href={`/linhas/${linha.slug}`}
      className="card group flex items-center gap-4 p-4"
      aria-label={`Ver detalhes da linha ${linha.numero} ${linha.nome}`}
    >
      <span className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        {linha.numero || "—"}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-slate-800 group-hover:text-brand-700">
          {linha.nome}
        </span>
        {(linha.origem || linha.destino) && (
          <span className="mt-0.5 block truncate text-sm text-slate-500">
            {[linha.origem, linha.destino].filter(Boolean).join(" → ")}
          </span>
        )}
        {linha.cidadeNome && !linha.origem && (
          <span className="mt-0.5 block truncate text-sm text-slate-500">
            {linha.cidadeNome}
          </span>
        )}
      </span>
    </Link>
  );
}

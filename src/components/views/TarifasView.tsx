import { PageHeader } from "@/components/ui/PageHeader";
import type { Tarifa } from "@/lib/tarifas-data";

interface Crumb {
  label: string;
  href?: string;
}

/**
 * View de listagem de tarifas. Reutilizada pela rota principal e sua alias.
 * Exibe cada tipo de tarifa em um card com o valor em destaque, seguido da
 * fonte/observação legal.
 */
export function TarifasView({
  title,
  description,
  breadcrumbs,
  tarifas,
  fonte,
}: {
  title: string;
  description?: string;
  breadcrumbs: Crumb[];
  tarifas: Tarifa[];
  fonte?: string;
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      />

      <section className="container-page py-8">
        <ul className="grid gap-4 sm:grid-cols-2">
          {tarifas.map((t) => (
            <li
              key={`${t.tipo}-${t.valor}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tipo
                </p>
                <p className="truncate text-lg font-semibold text-slate-800">
                  {t.tipo}
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-lg font-bold tabular-nums text-white">
                {t.valor}
              </span>
            </li>
          ))}
        </ul>

        {fonte && (
          <p className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500">
            {fonte}
          </p>
        )}
      </section>
    </>
  );
}

import { PageHeader } from "@/components/ui/PageHeader";
import { TarifasEntornoExplorer } from "@/components/ui/TarifasEntornoExplorer";
import {
  fonteTarifasCidadesEntorno,
  tarifasCidadesEntorno,
} from "@/lib/tarifas-data";

/**
 * View de tarifas do Entorno. Reutilizada pela rota principal
 * (/tarifas/cidades-entorno) e pela alias (/pages/tarifas-entorno).
 */
export function TarifasEntornoView() {
  return (
    <>
      <PageHeader
        title="Tarifas — Cidades do Entorno"
        description="Valores das linhas intermunicipais entre o Entorno e o Distrito Federal."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Tarifas", href: "/tarifas" },
          { label: "Cidades do Entorno" },
        ]}
      />

      <section className="container-page py-8">
        <TarifasEntornoExplorer tarifas={tarifasCidadesEntorno} />

        <p className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500">
          {fonteTarifasCidadesEntorno}
        </p>
      </section>
    </>
  );
}

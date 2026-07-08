import { busService } from "@/application/services/bus-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { CidadeCard } from "@/components/ui/CidadeCard";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";

/**
 * View compartilhada da listagem de cidades.
 * Renderizada tanto pela rota principal (/cidades) quanto pela alias (/city).
 */
export async function CidadesView() {
  let cidades;
  try {
    cidades = await busService.getCidades();
  } catch {
    cidades = null;
  }

  return (
    <>
      <PageHeader
        title="Cidades"
        description="Selecione uma cidade para ver as linhas de ônibus disponíveis."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Cidades" }]}
      />

      <section className="container-page py-8">
        {!cidades ? (
          <ApiErrorNotice />
        ) : cidades.length === 0 ? (
          <p className="text-slate-500">Nenhuma cidade disponível no momento.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cidades.map((cidade) => (
              <li key={cidade.id}>
                <CidadeCard cidade={cidade} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

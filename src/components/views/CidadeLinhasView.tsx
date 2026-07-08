import { notFound } from "next/navigation";
import { busService } from "@/application/services/bus-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinhasExplorer } from "@/components/ui/LinhasExplorer";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";

/**
 * View compartilhada das linhas de uma cidade específica.
 * Usada por /cidades/[slug] e pela alias /city/[slug].
 */
export async function CidadeLinhasView({ slug }: { slug: string }) {
  let cidade;
  let linhas;
  try {
    cidade = await busService.getCidadeBySlug(slug);
    if (!cidade) notFound();
    linhas = await busService.getLinhas(slug);
  } catch {
    // Diferencia "não encontrada" (notFound acima) de falha de API.
    return (
      <>
        <PageHeader
          title="Linhas da cidade"
          breadcrumbs={[
            { label: "Início", href: "/" },
            { label: "Cidades", href: "/cidades" },
          ]}
        />
        <section className="container-page py-8">
          <ApiErrorNotice />
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Linhas em ${cidade.nome}`}
        description={`Confira as linhas de ônibus que atendem ${cidade.nome}${
          cidade.uf ? ` (${cidade.uf})` : ""
        }.`}
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Cidades", href: "/cidades" },
          { label: cidade.nome },
        ]}
      />

      <section className="container-page py-8">
        {linhas.length === 0 ? (
          <p className="text-slate-500">
            Nenhuma linha cadastrada para esta cidade no momento.
          </p>
        ) : (
          <LinhasExplorer
            linhas={linhas}
            placeholder={`Buscar linha em ${cidade.nome}…`}
          />
        )}
      </section>
    </>
  );
}

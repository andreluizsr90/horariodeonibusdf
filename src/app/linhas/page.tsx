import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { busService } from "@/application/services/bus-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinhasExplorer } from "@/components/ui/LinhasExplorer";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";

// Dinâmica por requisição — ver nota em src/app/page.tsx. Evita que o build
// (sem credenciais da API) pré-renderize esta página com o estado de erro.
export const dynamic = "force-dynamic";

// Rota de TODAS as linhas. Por decisão de SEO do projeto, o canonical
// aponta para a HOME ("/"), tratada como a página raiz de linhas.
export const metadata: Metadata = buildMetadata({
  title: "Todas as linhas",
  description:
    "Lista completa de linhas de ônibus do Distrito Federal e Entorno.",
  canonicalPath: "/",
});

export default async function LinhasPage() {
  let linhas;
  try {
    linhas = await busService.getLinhas();
  } catch {
    linhas = null;
  }

  return (
    <>
      <PageHeader
        title="Todas as linhas"
        description="Pesquise e navegue por todas as linhas disponíveis."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Linhas" }]}
      />
      <section className="container-page py-8">
        {linhas ? (
          <LinhasExplorer linhas={linhas} />
        ) : (
          <ApiErrorNotice />
        )}
      </section>
    </>
  );
}

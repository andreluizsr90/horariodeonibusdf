import type { Metadata } from "next";
import { busService } from "@/application/services/bus-service";
import { buildMetadata } from "@/lib/seo";
import { config } from "@/lib/config";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinhasExplorer } from "@/components/ui/LinhasExplorer";
import { ApiErrorNotice } from "@/components/ui/ApiErrorNotice";

// Revalidação ISR: a página se recompõe periodicamente, recuperando-se
// automaticamente caso a API esteja indisponível no momento do build.
export const revalidate = 900;

// A home é a rota canônica para "/" e também para "/linhas".
export const metadata: Metadata = buildMetadata({
  title: config.site.name,
  description: config.site.description,
  canonicalPath: "/",
});

export default async function HomePage() {
  let linhas;
  try {
    // Busca todas as linhas para permitir a pesquisa completa, mas a home
    // exibe apenas 50 aleatórias enquanto não há busca ativa.
    linhas = await busService.getLinhas();
  } catch {
    linhas = null;
  }

  // Embaralha uma cópia para escolher quais 50 aparecem inicialmente.
  const embaralhadas = linhas
    ? [...linhas].sort(() => Math.random() - 0.5)
    : [];

  return (
    <>
      <PageHeader
        title="Horários de ônibus do DF e Entorno"
        description="Encontre rapidamente a sua linha pelo nome ou número e consulte horários e itinerários."
      />

      <section className="container-page py-8">
        {linhas ? (
          <LinhasExplorer linhas={embaralhadas} limiteInicial={50} />
        ) : (
          <ApiErrorNotice />
        )}
      </section>
    </>
  );
}

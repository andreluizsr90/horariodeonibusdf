import Link from "next/link";
import { notFound } from "next/navigation";
import { busService } from "@/application/services/bus-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { MapaLocalizacao } from "@/components/ui/MapaLocalizacao";

/**
 * View compartilhada da localização em tempo real de uma linha.
 * Renderizada pela rota principal (/linhas/[slug]/localizacao) e pelas
 * aliases (/travel/live/[slug] e /linha/[slug]/localizacao), que apenas
 * diferem no canonical dos metadados.
 */
export async function LocalizacaoView({ slug }: { slug: string }) {
  const linha = await busService.getLinhaDetalhe(slug);
  if (!linha) notFound();

  return (
    <>
      <PageHeader
        title={`Ônibus em tempo real — ${linha.numero ? `Linha ${linha.numero}` : linha.nome}`}
        description={
          linha.origem || linha.destino
            ? [linha.origem, linha.destino].filter(Boolean).join(" → ")
            : "Posição atual dos veículos sobre o traçado da linha."
        }
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Linhas", href: "/linhas" },
          { label: linha.numero || linha.nome, href: `/linhas/${slug}` },
          { label: "Tempo real" },
        ]}
      />

      <div className="container-page py-8">
        {linha.semob ? (
          <MapaLocalizacao numero={linha.numero} percurso={linha.percurso} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            O rastreamento em tempo real está disponível apenas para as linhas do
            sistema Semob/DFTrans. Esta linha não oferece esse recurso.
          </div>
        )}

        <Link
          href={`/linhas/${slug}`}
          className="mt-8 inline-flex text-sm font-medium text-brand-700 hover:underline"
        >
          ← Voltar aos detalhes da linha
        </Link>
      </div>
    </>
  );
}

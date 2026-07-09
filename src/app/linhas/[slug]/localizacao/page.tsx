import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { busService } from "@/application/services/bus-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { MapaLocalizacao } from "@/components/ui/MapaLocalizacao";

// Depende da API autenticada (numero/percurso) e é 100% tempo real.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const linha = await busService.getLinhaDetalhe(slug).catch(() => null);

  if (!linha) {
    return buildMetadata({
      title: "Linha não encontrada",
      canonicalPath: `/linhas/${slug}/localizacao`,
      noindex: true,
    });
  }

  const titulo = `${linha.numero ? `Linha ${linha.numero} — ` : ""}${linha.nome}`;
  return buildMetadata({
    title: `Localização em tempo real — ${titulo}`,
    description: `Acompanhe no mapa, em tempo real, a posição dos ônibus da ${titulo}.`,
    canonicalPath: `/linhas/${slug}/localizacao`,
    // Página de tempo real (sem conteúdo estável) — não é alvo de indexação.
    noindex: true,
  });
}

export default async function LocalizacaoPage({ params }: Props) {
  const { slug } = await params;
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

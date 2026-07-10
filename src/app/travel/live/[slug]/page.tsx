import type { Metadata } from "next";
import { buildMetadata, tituloLinha } from "@/lib/seo";
import { busService } from "@/application/services/bus-service";
import { LocalizacaoView } from "@/components/views/LocalizacaoView";

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

  const titulo = tituloLinha(linha.numero, linha.nome);
  // Rota ALIAS de /linhas/[slug]/localizacao — canonical aponta para a principal.
  return buildMetadata({
    title: `Localização em tempo real — ${titulo}`,
    description: `Acompanhe no mapa, em tempo real, a posição dos ônibus da ${titulo}.`,
    canonicalPath: `/linhas/${slug}/localizacao`,
    // Página de tempo real (sem conteúdo estável) — não é alvo de indexação.
    noindex: true,
  });
}

export default async function TravelLiveAliasPage({ params }: Props) {
  const { slug } = await params;
  return <LocalizacaoView slug={slug} />;
}

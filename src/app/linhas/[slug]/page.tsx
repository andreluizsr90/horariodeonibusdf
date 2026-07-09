import type { Metadata } from "next";
import { buildMetadata, tituloLinha } from "@/lib/seo";
import { busService } from "@/application/services/bus-service";
import { LinhaDetalheView } from "@/components/views/LinhaDetalheView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const linha = await busService.getLinhaDetalhe(slug).catch(() => null);

  if (!linha) {
    return buildMetadata({
      title: "Linha não encontrada",
      canonicalPath: `/linhas/${slug}`,
      noindex: true,
    });
  }

  const titulo = tituloLinha(linha.numero, linha.nome);
  const rota =
    linha.origem || linha.destino
      ? [linha.origem, linha.destino].filter(Boolean).join(" → ")
      : "";

  // Rota PRINCIPAL — canonical aponta para si mesma.
  return buildMetadata({
    title: titulo,
    description:
      `Horários, itinerário e informações da ${titulo}.` +
      (rota ? ` Trajeto: ${rota}.` : ""),
    canonicalPath: `/linhas/${slug}`,
  });
}

export default async function LinhaDetalhePage({ params }: Props) {
  const { slug } = await params;
  return <LinhaDetalheView slug={slug} />;
}

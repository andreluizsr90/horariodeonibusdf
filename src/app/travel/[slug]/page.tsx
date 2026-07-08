import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
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

  const titulo = `${linha.numero ? `Linha ${linha.numero} — ` : ""}${linha.nome}`;

  // Rota ALIAS de /linhas/[slug] — canonical aponta para a rota principal.
  return buildMetadata({
    title: titulo,
    description: `Horários, itinerário e informações da ${titulo}.`,
    canonicalPath: `/linhas/${slug}`,
  });
}

export default async function TravelAliasPage({ params }: Props) {
  const { slug } = await params;
  return <LinhaDetalheView slug={slug} />;
}

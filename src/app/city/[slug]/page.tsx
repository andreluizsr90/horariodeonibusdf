import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { busService } from "@/application/services/bus-service";
import { CidadeLinhasView } from "@/components/views/CidadeLinhasView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cidade = await busService.getCidadeBySlug(slug).catch(() => null);
  const nome = cidade?.nome ?? "Cidade";

  // Rota ALIAS de /cidades/[slug] — canonical aponta para a rota principal.
  return buildMetadata({
    title: `Linhas em ${nome}`,
    description: `Horários e linhas de ônibus disponíveis em ${nome}.`,
    canonicalPath: `/cidades/${slug}`,
  });
}

export default async function CityLinhasAliasPage({ params }: Props) {
  const { slug } = await params;
  return <CidadeLinhasView slug={slug} />;
}

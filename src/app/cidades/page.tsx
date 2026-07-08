import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CidadesView } from "@/components/views/CidadesView";

export const revalidate = 3600;

// Rota PRINCIPAL — canonical aponta para si mesma.
export const metadata: Metadata = buildMetadata({
  title: "Cidades",
  description:
    "Lista de cidades do Distrito Federal e Entorno com linhas de ônibus disponíveis.",
  canonicalPath: "/cidades",
});

export default function CidadesPage() {
  return <CidadesView />;
}

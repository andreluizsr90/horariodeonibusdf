import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CidadesView } from "@/components/views/CidadesView";

// Dinâmica por requisição — ver nota em src/app/page.tsx. Evita que o build
// (sem credenciais da API) pré-renderize esta página com o estado de erro.
export const dynamic = "force-dynamic";

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

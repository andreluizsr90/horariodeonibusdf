import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CidadesView } from "@/components/views/CidadesView";

// Dinâmica por requisição — ver nota em src/app/page.tsx. Evita que o build
// (sem credenciais da API) pré-renderize esta página com o estado de erro.
export const dynamic = "force-dynamic";

// Rota ALIAS de /cidades — renderiza o MESMO conteúdo, mas o canonical
// aponta para a rota principal (/cidades) para consolidar o SEO.
export const metadata: Metadata = buildMetadata({
  title: "Cidades",
  description:
    "Lista de cidades do Distrito Federal e Entorno com linhas de ônibus disponíveis.",
  canonicalPath: "/cidades",
});

export default function CityAliasPage() {
  return <CidadesView />;
}

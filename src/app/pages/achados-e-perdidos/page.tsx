import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { AchadosView } from "@/components/views/AchadosView";

// Rota ALIAS de /achados-e-perdidos — canonical aponta para a principal.
export const metadata: Metadata = buildMetadata({
  title: "Achados e Perdidos",
  description:
    "Contatos das operadoras de ônibus do DF para recuperar itens perdidos no transporte público.",
  canonicalPath: "/achados-e-perdidos",
});

export default function AchadosAliasPage() {
  return <AchadosView />;
}

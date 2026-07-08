import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { AchadosView } from "@/components/views/AchadosView";

// Rota PRINCIPAL — canonical aponta para si mesma.
export const metadata: Metadata = buildMetadata({
  title: "Achados e Perdidos",
  description:
    "Contatos das operadoras de ônibus do DF para recuperar itens perdidos no transporte público.",
  canonicalPath: "/achados-e-perdidos",
});

export default function AchadosEPerdidosPage() {
  return <AchadosView />;
}

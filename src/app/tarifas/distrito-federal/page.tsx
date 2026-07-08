import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { TarifasView } from "@/components/views/TarifasView";
import {
  fonteTarifasDistritoFederal,
  tarifasDistritoFederal,
} from "@/lib/tarifas-data";

// Rota PRINCIPAL — canonical aponta para si mesma.
export const metadata: Metadata = buildMetadata({
  title: "Tarifas — Distrito Federal",
  description: "Valores das tarifas do transporte público no Distrito Federal.",
  canonicalPath: "/tarifas/distrito-federal",
});

export default function TarifasDFPage() {
  return (
    <TarifasView
      title="Tarifas — Distrito Federal"
      description="Valores praticados nas linhas do Distrito Federal."
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Tarifas", href: "/tarifas" },
        { label: "Distrito Federal" },
      ]}
      tarifas={tarifasDistritoFederal}
      fonte={fonteTarifasDistritoFederal}
    />
  );
}

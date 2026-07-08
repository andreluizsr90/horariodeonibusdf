import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { TarifasEntornoView } from "@/components/views/TarifasEntornoView";

// Rota PRINCIPAL — canonical aponta para si mesma.
export const metadata: Metadata = buildMetadata({
  title: "Tarifas — Cidades do Entorno",
  description: "Valores das tarifas do transporte nas Cidades do Entorno.",
  canonicalPath: "/tarifas/cidades-entorno",
});

export default function TarifasEntornoPage() {
  return <TarifasEntornoView />;
}

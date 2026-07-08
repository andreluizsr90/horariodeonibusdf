import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { TarifasEntornoView } from "@/components/views/TarifasEntornoView";

// Rota ALIAS de /tarifas/cidades-entorno — canonical aponta para a principal.
export const metadata: Metadata = buildMetadata({
  title: "Tarifas — Cidades do Entorno",
  description: "Valores das tarifas do transporte nas Cidades do Entorno.",
  canonicalPath: "/tarifas/cidades-entorno",
});

export default function TarifasEntornoAliasPage() {
  return <TarifasEntornoView />;
}

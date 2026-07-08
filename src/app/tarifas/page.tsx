import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = buildMetadata({
  title: "Tarifas",
  description:
    "Consulte as tarifas do transporte público do Distrito Federal e das Cidades do Entorno.",
  canonicalPath: "/tarifas",
});

const opcoes = [
  {
    href: "/tarifas/distrito-federal",
    titulo: "Distrito Federal",
    descricao:
      "Valores das tarifas das linhas que operam dentro do Distrito Federal.",
  },
  {
    href: "/tarifas/cidades-entorno",
    titulo: "Cidades do Entorno",
    descricao:
      "Valores das tarifas das linhas que atendem as cidades do Entorno.",
  },
];

export default function TarifasPage() {
  return (
    <>
      <PageHeader
        title="Tarifas"
        description="Selecione a categoria para consultar os valores."
        breadcrumbs={[{ label: "Início", href: "/" }, { label: "Tarifas" }]}
      />
      <section className="container-page py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {opcoes.map((op) => (
            <Link key={op.href} href={op.href} className="card group p-6">
              <h2 className="text-lg font-semibold text-slate-800 group-hover:text-brand-700">
                {op.titulo}
              </h2>
              <p className="mt-2 text-sm text-slate-500">{op.descricao}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                Ver tarifas
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

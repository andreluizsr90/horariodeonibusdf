import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

// 404 não deve ser indexada.
export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Página não encontrada"
        description="O conteúdo que você procura não existe ou foi movido."
      />
      <section className="container-page py-12">
        <p className="text-6xl font-bold text-brand-200">404</p>
        <Link href="/" className="btn-primary mt-6">
          Voltar para a página inicial
        </Link>
      </section>
    </>
  );
}

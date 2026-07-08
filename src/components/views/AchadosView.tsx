import { PageHeader } from "@/components/ui/PageHeader";
import {
  introAchadosEPerdidos,
  operadoras,
  type Operadora,
} from "@/lib/achados-data";

/**
 * View de Achados e Perdidos. Reutilizada pela rota principal
 * (/achados-e-perdidos) e pela alias (/pages/achados-e-perdidos).
 *
 * Lista as operadoras em cards, com telefones clicáveis (tel:) para facilitar
 * o contato no celular.
 */

/** Monta um href tel: a partir de um telefone brasileiro formatado. */
function telHref(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  return `tel:+55${digitos}`;
}

function IconeLocal() {
  return (
    <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.386 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
    </svg>
  );
}

function IconeTelefone() {
  return (
    <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 16.352V17.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
    </svg>
  );
}

function IconeMapa() {
  return (
    <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.157 2.176a1.5 1.5 0 00-1.147 0l-4.084 1.69A1.5 1.5 0 002 5.244v9.812a1.5 1.5 0 002.074 1.386l3.51-1.453 4.26 1.763a1.5 1.5 0 001.146 0l4.083-1.69A1.5 1.5 0 0018 13.756V3.944a1.5 1.5 0 00-2.073-1.386l-3.51 1.452-4.26-1.834zM7.58 5a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 017.58 5zm5.59 2a.75.75 0 00-1.5 0v6.5a.75.75 0 001.5 0V7z" clipRule="evenodd" />
    </svg>
  );
}

function OperadoraCard({ operadora }: { operadora: Operadora }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-brand-700">
        {operadora.nome}
      </h2>

      <dl className="space-y-2.5 text-sm">
        <div className="flex gap-2">
          <dt className="pt-0.5">
            <IconeLocal />
            <span className="sr-only">Endereço</span>
          </dt>
          <dd className="text-slate-600">{operadora.endereco}</dd>
        </div>

        <div className="flex gap-2">
          <dt className="pt-0.5">
            <IconeTelefone />
            <span className="sr-only">Telefone</span>
          </dt>
          <dd className="flex flex-wrap gap-x-2 gap-y-1">
            {operadora.telefones.map((tel, i) => (
              <span key={tel} className="flex items-center">
                <a
                  href={telHref(tel)}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {tel}
                </a>
                {i < operadora.telefones.length - 1 && (
                  <span className="ml-2 text-slate-300" aria-hidden="true">
                    ·
                  </span>
                )}
              </span>
            ))}
            {operadora.fax && (
              <span className="text-slate-500">
                (Fax: {operadora.fax})
              </span>
            )}
          </dd>
        </div>

        <div className="flex gap-2">
          <dt className="pt-0.5">
            <IconeMapa />
            <span className="sr-only">Região de atuação</span>
          </dt>
          <dd className="text-slate-600">{operadora.regiao}</dd>
        </div>
      </dl>
    </li>
  );
}

export function AchadosView() {
  return (
    <>
      <PageHeader
        title="Achados e Perdidos"
        description="Perdeu algo no ônibus? Fale diretamente com a operadora responsável."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Achados e Perdidos" },
        ]}
      />

      <section className="container-page py-8">
        <p className="mb-6 max-w-3xl text-slate-600">
          {introAchadosEPerdidos}
        </p>

        <ul className="grid gap-4 sm:grid-cols-2">
          {operadoras.map((op) => (
            <OperadoraCard key={op.nome} operadora={op} />
          ))}
        </ul>
      </section>
    </>
  );
}

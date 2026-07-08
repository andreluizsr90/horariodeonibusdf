import Link from "next/link";
import { notFound } from "next/navigation";
import { busService } from "@/application/services/bus-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinhaDetalheContent } from "@/components/ui/LinhaDetalheContent";
import { MapaTrajeto } from "@/components/ui/MapaTrajeto";

/**
 * View compartilhada dos detalhes de uma linha (horários, itinerário e infos).
 * Usada por /linhas/[slug] e pela alias /travel/[slug].
 *
 * É um Server Component: busca os dados e delega a interatividade (abas,
 * seletor de dia, colapso do itinerário) ao componente client.
 */
export async function LinhaDetalheView({ slug }: { slug: string }) {
  const linha = await busService.getLinhaDetalhe(slug);
  if (!linha) notFound();

  const totalPontos = Math.max(
    0,
    ...linha.sentidos.map((s) => s.itinerario.length),
  );
  const totalSaidas = linha.sentidos.reduce(
    (acc, s) => acc + s.horarios.reduce((a, h) => a + h.saidas.length, 0),
    0,
  );

  return (
    <>
      <PageHeader
        title={`${linha.numero ? `Linha ${linha.numero} — ` : ""}${linha.nome}`}
        description={
          linha.origem || linha.destino
            ? [linha.origem, linha.destino].filter(Boolean).join(" → ")
            : undefined
        }
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Linhas", href: "/linhas" },
          { label: linha.numero || linha.nome },
        ]}
      >
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {linha.tarifa && <InfoBadge label="Tarifa" value={linha.tarifa} />}
          {linha.duracao && <InfoBadge label="Duração" value={linha.duracao} />}
          {linha.distancia && (
            <InfoBadge label="Distância" value={linha.distancia} />
          )}
          {linha.operadora && (
            <InfoBadge label="Operadora" value={linha.operadora} />
          )}
          {totalSaidas > 0 && (
            <InfoBadge label="Horários" value={`${totalSaidas} saídas`} />
          )}
          {totalPontos > 0 && (
            <InfoBadge label="Itinerário" value={`${totalPontos} pontos`} />
          )}
        </dl>
      </PageHeader>

      <div className="container-page py-8">
        <LinhaDetalheContent sentidos={linha.sentidos} />

        {linha.percurso && (
          // `key` por slug: força a remontagem (e o descarte da instância
          // Leaflet) ao navegar entre linhas, evitando vazamento de memória.
          <MapaTrajeto key={linha.slug} percurso={linha.percurso} />
        )}

        {linha.informacoesAdicionais && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Informações adicionais
            </h2>
            <p className="whitespace-pre-line rounded-xl border border-slate-200 bg-white p-5 text-slate-600">
              {linha.informacoesAdicionais}
            </p>
          </section>
        )}

        <Link
          href="/linhas"
          className="mt-8 inline-flex text-sm font-medium text-brand-700 hover:underline"
        >
          ← Ver todas as linhas
        </Link>
      </div>
    </>
  );
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

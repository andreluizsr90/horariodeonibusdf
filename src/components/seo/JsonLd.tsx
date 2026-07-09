/**
 * Injeta dados estruturados (JSON-LD / schema.org) no HTML.
 *
 * Server Component: renderiza uma tag <script type="application/ld+json">.
 * Usado para Organization/WebSite (global) e BreadcrumbList (por página),
 * habilitando rich results (breadcrumbs, sitelinks) nos motores de busca.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // O conteúdo é montado no servidor a partir de dados controlados.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

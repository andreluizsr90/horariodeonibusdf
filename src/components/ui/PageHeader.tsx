import Link from "next/link";
import type { ReactNode } from "react";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}

/** Cabeçalho de página com breadcrumb acessível e título. */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <div className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
      <div className="container-page py-8 md:py-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Trilha de navegação" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              {breadcrumbs.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition hover:text-brand-700"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-slate-700">
                      {crumb.label}
                    </span>
                  )}
                  {i < breadcrumbs.length - 1 && (
                    <span aria-hidden="true">/</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

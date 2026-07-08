import Link from "next/link";
import { config } from "@/lib/config";
import { navLinks } from "./nav-links";

/**
 * Rodapé global. Fica fixo ao final do conteúdo (empurrado para baixo pelo
 * layout flex do RootLayout, mesmo em páginas curtas).
 */
export function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="container-page flex flex-col gap-6 py-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="text-base font-semibold text-brand-700">
            {config.site.name}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {config.site.description}
          </p>
        </div>

        <nav aria-label="Links do rodapé">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate-600 transition hover:text-brand-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-100">
        <div className="container-page py-4 text-center text-sm text-slate-500">
          &copy; {ano} {config.site.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

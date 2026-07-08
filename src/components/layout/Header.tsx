"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "./nav-links";

/**
 * Cabeçalho global responsivo (mobile-first).
 *  - Logo à esquerda.
 *  - Navegação com dropdown de "Tarifas" no desktop.
 *  - Menu sanfona (hamburger) no mobile.
 * Acessível: aria-labels, aria-expanded, aria-current e navegação por teclado.
 */
export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tarifasOpen, setTarifasOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Horário de Ônibus DF — página inicial"
        >
          <Image
            src="/logo-horariodeonibusdf.png"
            alt="Horário de Ônibus DF"
            width={180}
            height={40}
            priority
            className="h-9 w-auto"
          />
        </Link>

        {/* Navegação desktop */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navegação principal"
        >
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => setTarifasOpen(true)}
                onMouseLeave={() => setTarifasOpen(false)}
              >
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-brand-50 hover:text-brand-700 ${
                    isActive(link.href)
                      ? "text-brand-700"
                      : "text-slate-700"
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={tarifasOpen}
                  onClick={() => setTarifasOpen((v) => !v)}
                >
                  {link.label}
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {tarifasOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-brand-50 hover:text-brand-700 ${
                  isActive(link.href) ? "text-brand-700" : "text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {/* Botão do menu mobile */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-slate-200 bg-white md:hidden"
          aria-label="Navegação principal (mobile)"
        >
          <ul className="container-page flex flex-col py-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 font-medium transition hover:bg-brand-50 ${
                    isActive(link.href) ? "text-brand-700" : "text-slate-700"
                  }`}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <ul className="ml-4 border-l border-slate-200 pl-2">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

<header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="container-page flex h-16 items-center justify-between gap-4">
        <a href="/" class="flex shrink-0 items-center" aria-label="{$site.name} — página inicial">
            <img src="/assets/img/logo-horariodeonibusdf.png" alt="{$site.name}" class="h-9 w-auto" width="360" height="64">
        </a>

        <nav class="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            <a href="/" class="nav-link">Página Inicial</a>
            <a href="/cidades" class="nav-link">Cidades</a>
            <a href="/achados-e-perdidos" class="nav-link">Achados e Perdidos</a>

            <div class="relative" data-dropdown>
                <button type="button" class="nav-link flex items-center gap-1" data-dropdown-toggle
                        aria-haspopup="menu" aria-expanded="false">
                    Tarifas
                    <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                </button>
                <div class="absolute right-0 top-full hidden w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                     data-dropdown-menu role="menu">
                    <a href="/tarifas/distrito-federal" class="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700" role="menuitem">Distrito Federal</a>
                    <a href="/tarifas/cidades-entorno" class="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700" role="menuitem">Cidades do Entorno</a>
                </div>
            </div>
        </nav>

        <button type="button" class="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
                aria-label="Abrir menu" aria-expanded="false" data-mobile-toggle>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/></svg>
        </button>
    </div>

    <nav class="hidden border-t border-slate-200 bg-white md:hidden" aria-label="Navegação mobile" data-mobile-menu>
        <ul class="container-page flex flex-col py-2">
            <li><a href="/" class="block rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-brand-50">Página Inicial</a></li>
            <li><a href="/cidades" class="block rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-brand-50">Cidades</a></li>
            <li><a href="/achados-e-perdidos" class="block rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-brand-50">Achados e Perdidos</a></li>
            <li><a href="/tarifas/distrito-federal" class="block rounded-lg px-3 py-2.5 text-slate-700 hover:bg-brand-50">Tarifas — Distrito Federal</a></li>
            <li><a href="/tarifas/cidades-entorno" class="block rounded-lg px-3 py-2.5 text-slate-700 hover:bg-brand-50">Tarifas — Cidades do Entorno</a></li>
        </ul>
    </nav>
</header>

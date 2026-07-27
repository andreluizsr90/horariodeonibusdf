<?php $e = fn($v) => htmlspecialchars((string) $v, ENT_QUOTES); ?>

<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
  <div class="container-page py-8 md:py-10">
    <nav aria-label="Trilha de navegação" class="mb-3">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li><a href="<?= BASE_URL ?>" class="hover:text-brand-700">Início</a></li>
        <li aria-hidden="true">/</li>
        <li class="text-slate-700">Tarifas</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Tarifas</h1>
    <p class="mt-2 max-w-2xl text-slate-600">Selecione a categoria para consultar os valores.</p>
  </div>
</div>

<div class="container-page py-8">
  <div class="grid gap-4 sm:grid-cols-2">
    <a href="<?= BASE_URL ?>tarifas/distrito-federal" class="card group p-6">
      <h2 class="text-lg font-semibold text-slate-800 group-hover:text-brand-700">Distrito Federal</h2>
      <p class="mt-2 text-sm text-slate-500">Valores das tarifas das linhas que operam dentro do Distrito Federal.</p>
      <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">Ver tarifas <span aria-hidden="true">→</span></span>
    </a>
    <a href="<?= BASE_URL ?>tarifas/cidades-entorno" class="card group p-6">
      <h2 class="text-lg font-semibold text-slate-800 group-hover:text-brand-700">Cidades do Entorno</h2>
      <p class="mt-2 text-sm text-slate-500">Valores das tarifas das linhas que atendem as cidades do Entorno.</p>
      <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">Ver tarifas <span aria-hidden="true">→</span></span>
    </a>
  </div>
</div>

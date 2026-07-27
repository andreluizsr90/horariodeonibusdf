<?php
$e = fn($v) => htmlspecialchars((string) $v, ENT_QUOTES);
$tarifas = $tarifas ?? [];
?>

<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
  <div class="container-page py-8 md:py-10">
    <nav aria-label="Trilha de navegação" class="mb-3">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li><a href="<?= BASE_URL ?>" class="hover:text-brand-700">Início</a></li>
        <li aria-hidden="true">/</li>
        <li><a href="<?= BASE_URL ?>tarifas" class="hover:text-brand-700">Tarifas</a></li>
        <li aria-hidden="true">/</li>
        <li class="text-slate-700">Distrito Federal</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Tarifas — Distrito Federal</h1>
    <p class="mt-2 max-w-2xl text-slate-600">Valores praticados nas linhas do Distrito Federal.</p>
  </div>
</div>

<div class="container-page py-8">
  <ul class="grid gap-4 sm:grid-cols-2">
    <?php foreach ($tarifas as $t): ?>
      <li class="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Tipo</p>
          <p class="truncate text-lg font-semibold text-slate-800"><?= $e($t['tipo']) ?></p>
        </div>
        <span class="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-lg font-bold tabular-nums text-white"><?= $e($t['valor']) ?></span>
      </li>
    <?php endforeach; ?>
  </ul>

  <?php if (!empty($fonte)): ?>
    <p class="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500"><?= $e($fonte) ?></p>
  <?php endif; ?>
</div>

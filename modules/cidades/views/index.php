<?php
$e = fn($v) => htmlspecialchars((string) $v, ENT_QUOTES);
$cidades = $cidades ?? [];
?>

<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
  <div class="container-page py-8 md:py-10">
    <nav aria-label="Trilha de navegação" class="mb-3">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li><a href="<?= BASE_URL ?>" class="hover:text-brand-700">Início</a></li>
        <li aria-hidden="true">/</li>
        <li class="text-slate-700">Cidades</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Cidades</h1>
    <p class="mt-2 max-w-2xl text-slate-600">Selecione uma cidade para ver as linhas de ônibus disponíveis.</p>
  </div>
</div>

<div class="container-page py-8">
  <?php if (!empty($erro)): ?>
    <div role="alert" class="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
      <p class="text-lg font-semibold text-amber-800">Não foi possível carregar as cidades</p>
      <p class="mx-auto mt-2 max-w-md text-sm text-amber-700">Instabilidade temporária na conexão com o serviço de dados. Tente novamente em instantes.</p>
    </div>
  <?php elseif (empty($cidades)): ?>
    <p class="text-slate-500">Nenhuma cidade disponível no momento.</p>
  <?php else: ?>
    <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <?php foreach ($cidades as $c): ?>
        <li>
          <a href="<?= BASE_URL ?>cidades/<?= $e(rawurlencode($c['slug'])) ?>" class="card group flex items-center justify-between gap-3 p-5">
            <span class="min-w-0">
              <span class="block truncate text-lg font-semibold text-slate-800 group-hover:text-brand-700"><?= $e($c['nome']) ?></span>
              <span class="mt-0.5 block text-sm text-slate-500">
                <?= $c['totalLinhas'] !== null ? $e($c['totalLinhas']) . ' linha' . ($c['totalLinhas'] == 1 ? '' : 's') : 'Ver linhas disponíveis' ?>
                <?= !empty($c['uf']) ? ' · ' . $e($c['uf']) : '' ?>
              </span>
            </span>
            <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>
</div>

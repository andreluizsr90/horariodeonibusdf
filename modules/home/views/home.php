<?php
/**
 * View — página inicial. Recebe $linhas (array enxuto).
 * A busca, a lista e a seção de favoritos são renderizadas pelo site.js a
 * partir de window.__LINHAS (evita despejar centenas de cards no HTML).
 */
$linhas = $linhas ?? [];
?>

<!-- Cabeçalho -->
<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
  <div class="container-page py-8 md:py-10">
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Horários de ônibus do DF e Entorno</h1>
    <p class="mt-2 max-w-2xl text-slate-600">Encontre rapidamente a sua linha pelo nome ou número e consulte horários e itinerários.</p>
  </div>
</div>

<div class="container-page py-8">
  <?php if (empty($linhas)): ?>
    <div role="alert" class="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
      <p class="text-lg font-semibold text-amber-800">Não foi possível carregar as linhas</p>
      <p class="mx-auto mt-2 max-w-md text-sm text-amber-700">Instabilidade temporária na conexão com o serviço de dados. Tente novamente em instantes.</p>
    </div>
  <?php else: ?>
    <!-- Seção de favoritos (preenchida pelo site.js quando houver) -->
    <section id="favoritos" aria-labelledby="favoritos-titulo" class="mb-8 hidden rounded-2xl border border-accent-400/40 bg-accent-500/5 p-5 sm:p-6"></section>

    <!-- Busca -->
    <div class="relative mb-6">
      <label for="busca-linha" class="sr-only">Buscar linha de ônibus</label>
      <input id="busca-linha" type="search" placeholder="Buscar por nome ou número da linha…"
             class="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-4 pr-4 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200">
    </div>
    <p id="busca-status" class="mb-4 text-sm text-slate-500" aria-live="polite"></p>

    <ul id="linhas-lista" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"></ul>
  <?php endif; ?>
</div>

<script>
  window.__LINHAS = <?= json_encode($linhas, JSON_UNESCAPED_UNICODE) ?>;
</script>

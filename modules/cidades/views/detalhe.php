<?php
$e = fn($v) => htmlspecialchars((string) $v, ENT_QUOTES);
$cidade = $cidade ?? [];
$linhas = $linhas ?? [];
$nome = $cidade['nome'] ?? 'Cidade';
?>

<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
  <div class="container-page py-8 md:py-10">
    <nav aria-label="Trilha de navegação" class="mb-3">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li><a href="<?= BASE_URL ?>" class="hover:text-brand-700">Início</a></li>
        <li aria-hidden="true">/</li>
        <li><a href="<?= BASE_URL ?>cidades" class="hover:text-brand-700">Cidades</a></li>
        <li aria-hidden="true">/</li>
        <li class="text-slate-700"><?= $e($nome) ?></li>
      </ol>
    </nav>
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Linhas em <?= $e($nome) ?></h1>
    <p class="mt-2 max-w-2xl text-slate-600">Confira as linhas de ônibus que atendem <?= $e($nome) ?><?= !empty($cidade['uf']) ? ' (' . $e($cidade['uf']) . ')' : '' ?>.</p>
  </div>
</div>

<div class="container-page py-8">
  <?php if (!empty($erro)): ?>
    <div role="alert" class="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
      <p class="text-lg font-semibold text-amber-800">Não foi possível carregar os dados</p>
      <p class="mx-auto mt-2 max-w-md text-sm text-amber-700">Tente novamente em alguns instantes.</p>
    </div>
  <?php elseif (empty($linhas)): ?>
    <p class="text-slate-500">Nenhuma linha cadastrada para esta cidade no momento.</p>
  <?php else: ?>
    <div class="relative mb-6">
      <label for="busca-linha" class="sr-only">Buscar linha</label>
      <input id="busca-linha" type="search" placeholder="Buscar linha em <?= $e($nome) ?>…"
             class="w-full rounded-xl border border-slate-300 bg-white py-3.5 px-4 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200">
    </div>
    <p id="busca-status" class="mb-4 text-sm text-slate-500" aria-live="polite"></p>
    <ul id="linhas-lista" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"></ul>
    <script>
      window.__LINHAS = <?= json_encode($linhas, JSON_UNESCAPED_UNICODE) ?>;
      window.__LINHAS_LIMITE = 0; /* 0 = sem limite: mostra todas */
    </script>
  <?php endif; ?>
</div>

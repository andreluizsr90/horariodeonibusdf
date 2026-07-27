<?php
$e = fn($v) => htmlspecialchars((string) $v, ENT_QUOTES);
$tarifas = $tarifas ?? [];

/** "AGUAS LINDAS DE GOIAS" → "Aguas Lindas de Goias" (conectivos minúsculos). */
function titulo_local(string $texto): string {
    $t = mb_convert_case(mb_strtolower($texto, 'UTF-8'), MB_CASE_TITLE, 'UTF-8');
    return preg_replace_callback('/\b(De|Do|Da|Dos|Das|E)\b/u', fn($m) => mb_strtolower($m[1], 'UTF-8'), $t);
}
?>

<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
  <div class="container-page py-8 md:py-10">
    <nav aria-label="Trilha de navegação" class="mb-3">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li><a href="<?= BASE_URL ?>" class="hover:text-brand-700">Início</a></li>
        <li aria-hidden="true">/</li>
        <li><a href="<?= BASE_URL ?>tarifas" class="hover:text-brand-700">Tarifas</a></li>
        <li aria-hidden="true">/</li>
        <li class="text-slate-700">Cidades do Entorno</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Tarifas — Cidades do Entorno</h1>
    <p class="mt-2 max-w-2xl text-slate-600">Valores das linhas intermunicipais entre o Entorno e o Distrito Federal.</p>
  </div>
</div>

<div class="container-page py-8">
  <!-- Busca por origem/destino (filtro no site.js) -->
  <div class="relative mb-4">
    <label for="busca-tarifa" class="sr-only">Buscar tarifa por origem ou destino</label>
    <input id="busca-tarifa" type="search" placeholder="Buscar por cidade de origem ou destino…"
           class="w-full rounded-xl border border-slate-300 bg-white py-3.5 px-4 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200">
  </div>
  <p id="tarifa-status" class="mb-4 text-sm text-slate-500" aria-live="polite"><?= count($tarifas) ?> trajetos disponíveis</p>

  <ul id="tarifas-lista" class="space-y-2">
    <?php foreach ($tarifas as $t):
      $origem = titulo_local($t['origem']);
      $destino = titulo_local($t['destino']); ?>
      <li class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          data-busca="<?= $e(mb_strtolower($t['origem'] . ' ' . $t['destino'], 'UTF-8')) ?>">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded bg-accent-500/20 px-1 text-xs font-bold text-accent-600"><?= $e($t['ufOrigem']) ?></span>
          <span class="font-medium text-slate-800"><?= $e($origem) ?></span>
          <svg class="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h9.19L9.72 6.03a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
          <span class="inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded bg-brand-100 px-1 text-xs font-bold text-brand-800"><?= $e($t['ufDestino']) ?></span>
          <span class="font-medium text-slate-800"><?= $e($destino) ?></span>
          <?php if (!empty($t['marcador'])): ?>
            <span class="inline-flex items-center rounded-full bg-accent-500/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent-600"><?= $e($t['marcador']) ?></span>
          <?php endif; ?>
        </div>
        <span class="shrink-0 self-start rounded-lg bg-brand-600 px-3 py-1.5 text-base font-bold tabular-nums text-white sm:self-auto"><?= $e($t['valor']) ?></span>
      </li>
    <?php endforeach; ?>
  </ul>

  <div id="tarifas-vazio" class="hidden rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
    Nenhum trajeto encontrado.
  </div>

  <?php if (!empty($fonte)): ?>
    <p class="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500"><?= $e($fonte) ?></p>
  <?php endif; ?>
</div>

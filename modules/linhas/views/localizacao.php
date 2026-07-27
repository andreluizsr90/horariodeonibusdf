<?php
$e = fn($v) => htmlspecialchars((string) $v, ENT_QUOTES);
$linha = $linha ?? [];
$slug = $linha['slug'] ?? '';
$numero = $linha['numero'] ?? '';
$rota = array_filter([$linha['origem'] ?? null, $linha['destino'] ?? null]);
?>

<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
  <div class="container-page py-8 md:py-10">
    <nav aria-label="Trilha de navegação" class="mb-3">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li><a href="<?= BASE_URL ?>" class="hover:text-brand-700">Início</a></li>
        <li aria-hidden="true">/</li>
        <li><a href="<?= BASE_URL ?>linhas" class="hover:text-brand-700">Linhas</a></li>
        <li aria-hidden="true">/</li>
        <li><a href="<?= BASE_URL ?>linhas/<?= $e($slug) ?>" class="hover:text-brand-700"><?= $e($numero ?: $linha['nome']) ?></a></li>
        <li aria-hidden="true">/</li>
        <li class="text-slate-700">Tempo real</li>
      </ol>
    </nav>
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
      Ônibus em tempo real — <?= $e($numero ? 'Linha ' . $numero : $linha['nome']) ?>
    </h1>
    <p class="mt-2 max-w-2xl text-slate-600">
      <?= !empty($rota) ? $e(implode(' → ', $rota)) : 'Posição atual dos veículos sobre o traçado da linha.' ?>
    </p>
  </div>
</div>

<div class="container-page py-8">
  <?php if (empty($linha['semob'])): ?>
    <div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      O rastreamento em tempo real está disponível apenas para as linhas do sistema Semob/DFTrans.
      Esta linha não oferece esse recurso.
    </div>
  <?php else: ?>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <p id="gps-status" class="text-sm text-slate-600" aria-live="polite">Carregando posições…</p>
      <p class="text-sm text-slate-500">Atualiza em <span id="gps-contador" class="font-semibold tabular-nums text-brand-700">10</span>s</p>
    </div>

    <!-- O mapa recebe número da linha (feed GPS) e o percurso estático. -->
    <div id="mapa-localizacao"
         class="h-[520px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
         data-numero="<?= $e($numero) ?>"
         data-percurso='<?= htmlspecialchars(json_encode($linha['percurso'] ?? null), ENT_QUOTES) ?>'></div>

    <p class="mt-3 text-xs text-slate-500">
      Fonte dos dados de GPS: DFTrans/Semob. As posições dependem da transmissão dos veículos e podem sofrer atrasos.
    </p>
  <?php endif; ?>

  <a href="<?= BASE_URL ?>linhas/<?= $e($slug) ?>" class="mt-8 inline-flex text-sm font-medium text-brand-700 hover:underline">← Voltar aos detalhes da linha</a>
</div>

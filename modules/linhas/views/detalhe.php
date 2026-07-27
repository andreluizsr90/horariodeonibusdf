<?php
/**
 * View — detalhe da linha. Recebe $linha (array) e $titulo.
 * A interatividade (favoritar, mapa) é do assets/js/site.js.
 */
$linha = $linha ?? [];
$sentidos = $linha['sentidos'] ?? [];
$numero = $linha['numero'] ?? '';
$slug = $linha['slug'] ?? '';

$total_saidas = 0;
$total_pontos = 0;
foreach ($sentidos as $s) {
    foreach ($s['horarios'] as $h) { $total_saidas += count($h['saidas']); }
    $total_pontos = max($total_pontos, count($s['itinerario']));
}
$rota = array_filter([$linha['origem'] ?? null, $linha['destino'] ?? null]);
$e = fn($v) => htmlspecialchars((string) $v, ENT_QUOTES);
$star_path = 'M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z';
?>

<!-- ==================== Cabeçalho ==================== -->
<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
  <div class="container-page py-8 md:py-10">
    <nav aria-label="Trilha de navegação" class="mb-3">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li><a href="<?= BASE_URL ?>" class="hover:text-brand-700">Início</a></li>
        <li aria-hidden="true">/</li>
        <li><a href="<?= BASE_URL ?>linhas" class="hover:text-brand-700">Linhas</a></li>
        <li aria-hidden="true">/</li>
        <li class="text-slate-700"><?= $e($numero ?: $linha['nome']) ?></li>
      </ol>
    </nav>

    <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl"><?= $e($titulo) ?></h1>
    <?php if (!empty($rota)): ?>
      <p class="mt-2 max-w-2xl text-slate-600"><?= $e(implode(' → ', $rota)) ?></p>
    <?php endif; ?>

    <dl class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <?php if ($total_saidas > 0): ?>
        <div><dt class="text-xs uppercase tracking-wide text-slate-500">Horários</dt><dd class="font-semibold text-slate-800"><?= $total_saidas ?> saídas</dd></div>
      <?php endif; ?>
      <?php if ($total_pontos > 0): ?>
        <div><dt class="text-xs uppercase tracking-wide text-slate-500">Itinerário</dt><dd class="font-semibold text-slate-800"><?= $total_pontos ?> pontos</dd></div>
      <?php endif; ?>
    </dl>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <!-- Estrela de favoritar (estado atualizado pelo site.js) -->
      <button type="button" data-fav-toggle data-fav-slug="<?= $e($slug) ?>" data-fav-numero="<?= $e($numero) ?>"
              aria-pressed="false" aria-label="Adicionar linha <?= $e($numero) ?> aos favoritos"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-400 transition hover:border-accent-400">
        <svg class="star-icon h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linejoin="round" d="<?= $star_path ?>"/></svg>
        <span class="text-slate-700">Favoritar</span>
      </button>

      <?php if (!empty($linha['semob'])): ?>
        <a href="<?= BASE_URL ?>linhas/<?= $e($slug) ?>/localizacao"
           class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700">
          <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true"></span>
          Ver ônibus em tempo real
        </a>
      <?php endif; ?>
    </div>
  </div>
</div>

<!-- ==================== Conteúdo ==================== -->
<div class="container-page py-8">
  <?php if (empty($sentidos)): ?>
    <div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      Ainda não há horários ou itinerário disponíveis para esta linha.
    </div>
  <?php else: foreach ($sentidos as $si => $s): ?>
    <section class="<?= $si > 0 ? 'mt-10' : '' ?>">
      <?php if (count($sentidos) > 1): ?>
        <h2 class="mb-4 inline-flex rounded-lg bg-brand-600 px-3 py-1 text-sm font-semibold text-white">Sentido: <?= $e($s['nome']) ?></h2>
      <?php endif; ?>

      <div class="grid gap-6 lg:grid-cols-5">
        <!-- Horários -->
        <div class="lg:col-span-3">
          <h3 class="mb-4 text-lg font-semibold text-slate-900">Horários de saída</h3>
          <?php if (empty($s['horarios'])): ?>
            <p class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Horários não disponíveis para este sentido.</p>
          <?php else: ?>
            <div class="space-y-4">
              <?php foreach ($s['horarios'] as $h): ?>
                <div class="rounded-xl border border-slate-200 bg-white p-4">
                  <div class="mb-3 flex items-center justify-between gap-3">
                    <h4 class="font-semibold text-brand-700"><?= $e($h['dia']) ?></h4>
                    <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"><?= count($h['saidas']) ?> horário<?= count($h['saidas']) === 1 ? '' : 's' ?></span>
                  </div>
                  <ul class="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    <?php foreach ($h['saidas'] as $saida): ?>
                      <li class="rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-sm font-semibold tabular-nums text-slate-700"><?= $e($saida) ?></li>
                    <?php endforeach; ?>
                  </ul>
                </div>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>
        </div>

        <!-- Itinerário (container rolável) -->
        <div class="lg:col-span-2">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-slate-900">Itinerário</h3>
            <?php if (!empty($s['itinerario'])): ?>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"><?= count($s['itinerario']) ?> pontos</span>
            <?php endif; ?>
          </div>
          <?php if (empty($s['itinerario'])): ?>
            <p class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Itinerário não disponível para este sentido.</p>
          <?php else: ?>
            <div class="rounded-xl border border-slate-200 bg-white p-5">
              <div class="<?= count($s['itinerario']) > 8 ? 'max-h-[26rem] overflow-y-auto pr-1' : '' ?>">
                <ol class="relative space-y-4 border-l-2 border-brand-100 pl-6">
                  <?php $n = count($s['itinerario']); foreach ($s['itinerario'] as $pi => $ponto):
                    $origem = $pi === 0; $destino = $pi === $n - 1;
                    $cor = $origem ? 'bg-emerald-500' : ($destino ? 'bg-brand-600' : 'bg-brand-300'); ?>
                    <li class="relative">
                      <span class="absolute -left-[1.72rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white <?= $cor ?>" aria-hidden="true"></span>
                      <?php if ($origem || $destino): ?>
                        <span class="mb-0.5 block text-xs font-semibold uppercase tracking-wide <?= $origem ? 'text-emerald-600' : 'text-brand-700' ?>"><?= $origem ? 'Origem' : 'Destino' ?></span>
                      <?php endif; ?>
                      <span class="block text-sm <?= ($origem || $destino) ? 'font-semibold text-slate-800' : 'text-slate-600' ?>"><?= $e($ponto) ?></span>
                    </li>
                  <?php endforeach; ?>
                </ol>
              </div>
            </div>
          <?php endif; ?>
        </div>
      </div>
    </section>
  <?php endforeach; endif; ?>

  <!-- Banner de anúncio — antes do mapa do trajeto. -->
  <div class="my-8"><?php render_ad_unit('5989010611'); ?></div>

  <?php if (!empty($linha['percurso'])): ?>
    <section aria-label="Mapa do trajeto">
      <h2 class="mb-3 text-lg font-semibold text-slate-900">Mapa do trajeto</h2>
      <div id="mapa-trajeto" class="h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
           data-percurso='<?= htmlspecialchars(json_encode($linha['percurso']), ENT_QUOTES) ?>'></div>
    </section>
  <?php endif; ?>

  <?php if (!empty($linha['informacoesAdicionais'])): ?>
    <section class="mt-8">
      <h2 class="mb-3 text-lg font-semibold text-slate-900">Informações adicionais</h2>
      <p class="whitespace-pre-line rounded-xl border border-slate-200 bg-white p-5 text-slate-600"><?= $e($linha['informacoesAdicionais']) ?></p>
    </section>
  <?php endif; ?>

  <a href="<?= BASE_URL ?>linhas" class="mt-8 inline-flex text-sm font-medium text-brand-700 hover:underline">← Ver todas as linhas</a>
</div>

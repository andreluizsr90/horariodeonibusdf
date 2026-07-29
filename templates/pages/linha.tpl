{extends 'layout.tpl'}

{block 'head'}
    {if $linha->temMapa()}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
        <script defer src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    {/if}
{/block}

{block 'conteudo'}
<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
    <div class="container-page py-8 md:py-10">
        {include 'partials/breadcrumbs.tpl' crumbs=[
            ['label' => 'Início', 'href' => '/'],
            ['label' => 'Linhas', 'href' => '/linhas'],
            ['label' => $linha->numero ?: $linha->nome]
        ]}

        <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{$linha->titulo()}</h1>
        {if $linha->trajeto()}<p class="mt-2 max-w-2xl text-slate-600">{$linha->trajeto()}</p>{/if}

        <dl class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {if $linha->tarifa}<div><dt class="stat-label">Tarifa</dt><dd class="stat-value">{$linha->tarifa}</dd></div>{/if}
            {if $linha->operadora}<div><dt class="stat-label">Operadora</dt><dd class="stat-value">{$linha->operadora}</dd></div>{/if}
            {if $linha->totalSaidas() > 0}<div><dt class="stat-label">Horários</dt><dd class="stat-value">{$linha->totalSaidas()} saídas</dd></div>{/if}
            {if $linha->totalPontos() > 0}<div><dt class="stat-label">Itinerário</dt><dd class="stat-value">{$linha->totalPontos()} pontos</dd></div>{/if}
        </dl>

        <div class="mt-4 flex flex-wrap items-center gap-3">
            {include 'partials/star.tpl' slug=$linha->slug numero=$linha->numero label=true class='star-btn-label'}

            {* Tempo real existe apenas para linhas do sistema Semob/DFTrans. *}
            {if $linha->semob}
                <a href="/linhas/{$linha->slug|urlencode}/localizacao" class="btn-primary">
                    <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true"></span>
                    Ver ônibus em tempo real
                </a>
            {/if}
        </div>
    </div>
</div>

<div class="container-page py-8">
    {if count($linha->sentidos) == 0}
        <div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Ainda não há horários ou itinerário disponíveis para esta linha.
        </div>
    {/if}

    {foreach $linha->sentidos as $i => $sentido}
        <section class="{if $i > 0}mt-10{/if}">
            {if count($linha->sentidos) > 1}
                <h2 class="mb-4 inline-flex rounded-lg bg-brand-600 px-3 py-1 text-sm font-semibold text-white">
                    Sentido: {$sentido->nome}
                </h2>
            {/if}

            <div class="grid gap-6 lg:grid-cols-5">
                {* ---------------- Horários ---------------- *}
                <div class="lg:col-span-3">
                    <h3 class="mb-4 text-lg font-semibold text-slate-900">Horários de saída</h3>

                    {if count($sentido->horarios) == 0}
                        <p class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                            Horários não disponíveis para este sentido.
                        </p>
                    {else}
                        {* Blocos por tipo de dia, empilhados e sempre visíveis. *}
                        <div class="space-y-4">
                            {foreach $sentido->horarios as $h}
                                <div class="rounded-xl border border-slate-200 bg-white p-4">
                                    <div class="mb-3 flex items-center justify-between gap-3">
                                        <h4 class="font-semibold text-brand-700">{$h->dia}</h4>
                                        <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                                            {$h->total()} horário{if $h->total() != 1}s{/if}
                                        </span>
                                    </div>
                                    <ul class="grid grid-cols-4 gap-2 sm:grid-cols-6">
                                        {foreach $h->saidas as $saida}
                                            <li class="horario-chip">{$saida}</li>
                                        {/foreach}
                                    </ul>
                                </div>
                            {/foreach}
                        </div>
                    {/if}
                </div>

                {* ---------------- Itinerário ---------------- *}
                <div class="lg:col-span-2">
                    <div class="mb-4 flex items-center justify-between gap-3">
                        <h3 class="text-lg font-semibold text-slate-900">Itinerário</h3>
                        {if $sentido->totalPontos() > 0}
                            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                {$sentido->totalPontos()} pontos
                            </span>
                        {/if}
                    </div>

                    {if $sentido->totalPontos() == 0}
                        <p class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                            Itinerário não disponível para este sentido.
                        </p>
                    {else}
                        <div class="rounded-xl border border-slate-200 bg-white p-5">
                            {* Rolável quando longo — evita que domine a página. *}
                            <div class="{if $sentido->totalPontos() > 8}max-h-[26rem] overflow-y-auto pr-1{/if}">
                                <ol class="relative space-y-4 border-l-2 border-brand-100 pl-6">
                                    {foreach $sentido->itinerario as $idx => $ponto}
                                        {var $origem = $idx == 0}
                                        {var $destino = $idx == $sentido->totalPontos() - 1}
                                        <li class="relative">
                                            <span class="ponto-marker {if $origem}bg-emerald-500{elseif $destino}bg-brand-600{else}bg-brand-300{/if}" aria-hidden="true"></span>
                                            {if $origem || $destino}
                                                <span class="mb-0.5 block text-xs font-semibold uppercase tracking-wide {if $origem}text-emerald-600{else}text-brand-700{/if}">
                                                    {if $origem}Origem{else}Destino{/if}
                                                </span>
                                            {/if}
                                            <span class="block text-sm {if $origem || $destino}font-semibold text-slate-800{else}text-slate-600{/if}">{$ponto}</span>
                                        </li>
                                    {/foreach}
                                </ol>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </section>
    {/foreach}

    {* Anúncio antes do mapa do trajeto. *}
    <div class="my-8">{include 'partials/ad.tpl' slot='5989010611'}</div>

    {if $linha->temMapa()}
        <section aria-labelledby="mapa-titulo" class="mt-8">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 id="mapa-titulo" class="text-lg font-semibold text-slate-900">Mapa do trajeto</h2>

                {* Alternador de sentido — o site.js só o exibe quando a linha
                   tem Ida E Volta desenháveis (cada uma com 2+ pontos). *}
                <div id="mapa-sentidos" role="tablist" aria-label="Sentido do trajeto"
                     class="hidden rounded-xl bg-slate-100 p-1"></div>
            </div>

            <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div id="mapa-trajeto" role="application" aria-label="Mapa do trajeto da linha"
                     class="isolate h-[380px] w-full sm:h-[460px]"
                     data-percurso="{$linha->percurso->toArray()|json}"></div>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
                <span class="inline-flex items-center gap-2">
                    <span class="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true"></span>
                    Origem
                </span>
                <span class="inline-flex items-center gap-2">
                    <span id="legenda-destino" class="inline-block h-2.5 w-2.5 rounded-full bg-brand-600" aria-hidden="true"></span>
                    Destino
                </span>
            </div>
        </section>
    {/if}

    {if $linha->informacoesAdicionais}
        <section class="mt-8">
            <h2 class="mb-3 text-lg font-semibold text-slate-900">Informações adicionais</h2>
            <p class="whitespace-pre-line rounded-xl border border-slate-200 bg-white p-5 text-slate-600">{$linha->informacoesAdicionais}</p>
        </section>
    {/if}

    <a href="/linhas" class="mt-8 inline-flex text-sm font-medium text-brand-700 hover:underline">← Ver todas as linhas</a>
</div>
{/block}

{extends 'layout.tpl'}

{block 'head'}
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <script defer src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
{/block}

{block 'conteudo'}
    {include 'partials/page-header.tpl'
        titulo=$titulo_pagina
        descricao=$descricao_pagina
        crumbs=$crumbs}

    <div class="container-page py-8">
        {if !$linha->semob}
            <div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                O rastreamento em tempo real está disponível apenas para as linhas do sistema
                Semob/DFTrans. Esta linha não oferece esse recurso.
            </div>
        {else}
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p id="gps-status" class="text-sm text-slate-600" aria-live="polite">Carregando posições…</p>
                <p class="text-sm text-slate-500">Atualiza em <span id="gps-contador" class="font-semibold tabular-nums text-brand-700">10</span>s</p>
            </div>

            <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div id="mapa-localizacao" role="application"
                     aria-label="Mapa com a posição dos ônibus em tempo real"
                     class="isolate h-[420px] w-full sm:h-[520px]"
                     data-numero="{$linha->numero}"
                     data-percurso="{$percurso_json|json}"></div>
            </div>

            {* Legenda: rotas estáticas + pinos dos ônibus por sentido.
               O site.js exibe apenas os itens aplicáveis a esta linha. *}
            <div id="mapa-legenda" class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500"></div>

            <p class="mt-3 text-xs text-slate-500">
                Fonte dos dados de GPS: DFTrans/Semob. As posições dependem da transmissão dos
                veículos e podem sofrer atrasos.
            </p>
        {/if}

        <a href="/linhas/{$linha->slug|urlencode}" class="mt-8 inline-flex text-sm font-medium text-brand-700 hover:underline">← Voltar aos detalhes da linha</a>
    </div>
{/block}

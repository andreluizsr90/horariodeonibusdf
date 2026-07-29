{extends 'layout.tpl'}

{block 'conteudo'}
    {include 'partials/page-header.tpl'
        titulo='Tarifas — Cidades do Entorno'
        descricao='Valores das linhas intermunicipais entre o Entorno e o Distrito Federal.'
        crumbs=[['label' => 'Início', 'href' => '/'], ['label' => 'Tarifas', 'href' => '/tarifas'], ['label' => 'Cidades do Entorno']]}

    <div class="container-page py-8">
        <div class="relative mb-4">
            <label for="busca-tarifa" class="sr-only">Buscar tarifa por origem ou destino</label>
            <input id="busca-tarifa" type="search" class="input-busca" style="padding-left:1rem"
                   placeholder="Buscar por cidade de origem ou destino…" aria-describedby="tarifa-status">
        </div>
        <p id="tarifa-status" class="mb-4 text-sm text-slate-500" aria-live="polite">{count($itens)} trajetos disponíveis</p>

        <ul id="tarifas-lista" class="space-y-2">
            {foreach $itens as $t}
                <li class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    data-busca="{$t.origem} {$t.destino}">
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span class="uf-badge uf-go">{$t.uf_origem}</span>
                        <span class="font-medium text-slate-800">{$t.origem|titulo}</span>
                        <svg class="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h9.19L9.72 6.03a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
                        <span class="uf-badge uf-df">{$t.uf_destino}</span>
                        <span class="font-medium text-slate-800">{$t.destino|titulo}</span>
                        {if isset($t.marcador)}<span class="marcador">{$t.marcador}</span>{/if}
                    </div>
                    <span class="preco shrink-0 self-start sm:self-auto">{$t.valor}</span>
                </li>
            {/foreach}
        </ul>

        <div id="tarifas-vazio" class="hidden rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Nenhum trajeto encontrado.
        </div>

        <p class="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500">{$fonte}</p>
    </div>
{/block}

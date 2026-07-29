{extends 'layout.tpl'}

{block 'conteudo'}
    {include 'partials/page-header.tpl'
        titulo=$q ? "Busca: {$q}" : 'Todas as linhas'
        descricao=$q ? false : 'Pesquise e navegue por todas as linhas disponíveis.'
        crumbs=[['label' => 'Início', 'href' => '/'], ['label' => 'Linhas']]}

    <div class="container-page py-8">
        {if $erro}
            {include 'partials/erro-api.tpl' titulo='Não foi possível carregar as linhas'}
        {else}
            {include 'partials/busca.tpl'
                placeholder='Buscar por nome ou número da linha…'
                valor=$q
                status=$status}

            {if count($linhas) > 0}
                <ul id="linhas-lista" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {foreach $linhas as $linha}{include 'partials/linha-card.tpl' linha=$linha}{/foreach}
                </ul>
                <div id="linhas-vazio" class="hidden rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                    Nenhuma linha encontrada.
                </div>
            {else}
                <div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                    Nenhuma linha encontrada para “{$q}”.
                    <a href="/linhas" class="font-semibold text-brand-700 hover:underline">Ver todas as linhas</a>.
                </div>
            {/if}
        {/if}
    </div>
{/block}

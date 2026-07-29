{extends 'layout.tpl'}

{block 'conteudo'}
    {include 'partials/page-header.tpl'
        titulo='Horários de ônibus do DF e Entorno'
        descricao='Encontre rapidamente a sua linha pelo nome ou número e consulte horários e itinerários.'
        crumbs=false}

    <div class="container-page py-8">
        {if $erro}
            {include 'partials/erro-api.tpl' titulo='Não foi possível carregar as linhas'}
        {else}
            {* Favoritos: preenchido pelo site.js quando houver algo salvo. *}
            <section id="favoritos" aria-labelledby="favoritos-titulo"
                     class="mb-8 hidden rounded-2xl border border-accent-400/40 bg-accent-500/5 p-5 sm:p-6"></section>

            {include 'partials/busca.tpl'
                placeholder='Buscar por nome ou número da linha…'
                valor=''
                status=$status}

            {* Cards renderizados no SERVIDOR — indexáveis pelos buscadores. *}
            <ul id="linhas-lista" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {foreach $linhas as $linha}{include 'partials/linha-card.tpl' linha=$linha}{/foreach}
            </ul>

            <div id="linhas-vazio" class="hidden rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                Nenhuma linha encontrada entre as exibidas.
                <a id="busca-todos" href="/linhas" class="font-semibold text-brand-700 hover:underline">Buscar em todas as {$total} linhas</a>.
            </div>

            <p class="mt-6 text-center">
                <a href="/linhas" class="text-sm font-medium text-brand-700 hover:underline">Ver todas as {$total} linhas →</a>
            </p>
        {/if}
    </div>
{/block}

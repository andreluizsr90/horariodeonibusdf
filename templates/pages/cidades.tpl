{extends 'layout.tpl'}

{block 'conteudo'}
    {include 'partials/page-header.tpl'
        titulo='Cidades'
        descricao='Selecione uma cidade para ver as linhas de ônibus disponíveis.'
        crumbs=[['label' => 'Início', 'href' => '/'], ['label' => 'Cidades']]}

    <div class="container-page py-8">
        {if $erro}
            {include 'partials/erro-api.tpl' titulo='Não foi possível carregar as cidades'}
        {elseif count($cidades) == 0}
            <p class="text-slate-500">Nenhuma cidade disponível no momento.</p>
        {else}
            <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {foreach $cidades as $cidade}
                    <li>
                        <a href="/cidades/{$cidade->slug|urlencode}" class="card group flex items-center justify-between gap-3 p-5"
                           aria-label="Ver linhas de {$cidade->nome}">
                            <span class="min-w-0">
                                <span class="block truncate text-lg font-semibold text-slate-800 group-hover:text-brand-700">{$cidade->nome}</span>
                                <span class="mt-0.5 block text-sm text-slate-500">{$cidade->descricao()}</span>
                            </span>
                            <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>
                        </a>
                    </li>
                {/foreach}
            </ul>
        {/if}
    </div>
{/block}

{extends 'layout.tpl'}

{block 'conteudo'}
    {include 'partials/page-header.tpl'
        titulo='Tarifas — Distrito Federal'
        descricao='Valores praticados nas linhas do Distrito Federal.'
        crumbs=[['label' => 'Início', 'href' => '/'], ['label' => 'Tarifas', 'href' => '/tarifas'], ['label' => 'Distrito Federal']]}

    <div class="container-page py-8">
        <ul class="grid gap-4 sm:grid-cols-2">
            {foreach $itens as $t}
                <li class="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div class="min-w-0">
                        <p class="stat-label">Tipo</p>
                        <p class="truncate text-lg font-semibold text-slate-800">{$t.tipo}</p>
                    </div>
                    <span class="preco">{$t.valor}</span>
                </li>
            {/foreach}
        </ul>
        <p class="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-500">{$fonte}</p>
    </div>
{/block}

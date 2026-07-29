{extends 'layout.tpl'}

{block 'conteudo'}
    {include 'partials/page-header.tpl'
        titulo="Linhas em {$cidade->nome}"
        descricao="Confira as linhas de ônibus que atendem {$cidade->nome}."
        crumbs=[['label' => 'Início', 'href' => '/'], ['label' => 'Cidades', 'href' => '/cidades'], ['label' => $cidade->nome]]}

    <div class="container-page py-8">
        {if count($linhas) == 0}
            <p class="text-slate-500">Nenhuma linha cadastrada para esta cidade no momento.</p>
        {else}
            <p class="mb-4 text-sm text-slate-500">{count($linhas)} linha{if count($linhas) != 1}s{/if} nesta cidade</p>
            <ul id="linhas-lista" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {foreach $linhas as $linha}{include 'partials/linha-card.tpl' linha=$linha}{/foreach}
            </ul>
        {/if}
    </div>
{/block}

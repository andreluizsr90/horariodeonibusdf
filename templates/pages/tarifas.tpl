{extends 'layout.tpl'}

{block 'conteudo'}
    {include 'partials/page-header.tpl'
        titulo='Tarifas'
        descricao='Selecione a categoria para consultar os valores.'
        crumbs=[['label' => 'Início', 'href' => '/'], ['label' => 'Tarifas']]}

    <div class="container-page py-8">
        <div class="grid gap-4 sm:grid-cols-2">
            <a href="/tarifas/distrito-federal" class="card group p-6">
                <h2 class="text-lg font-semibold text-slate-800 group-hover:text-brand-700">Distrito Federal</h2>
                <p class="mt-2 text-sm text-slate-500">Valores das tarifas das linhas que operam dentro do Distrito Federal.</p>
                <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">Ver tarifas <span aria-hidden="true">→</span></span>
            </a>
            <a href="/tarifas/cidades-entorno" class="card group p-6">
                <h2 class="text-lg font-semibold text-slate-800 group-hover:text-brand-700">Cidades do Entorno</h2>
                <p class="mt-2 text-sm text-slate-500">Valores das tarifas das linhas que atendem as cidades do Entorno.</p>
                <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">Ver tarifas <span aria-hidden="true">→</span></span>
            </a>
        </div>
    </div>
{/block}

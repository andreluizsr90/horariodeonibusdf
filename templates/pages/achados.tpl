{extends 'layout.tpl'}

{block 'conteudo'}
    {include 'partials/page-header.tpl'
        titulo='Achados e Perdidos'
        descricao='Perdeu algo no ônibus? Fale diretamente com a operadora responsável.'
        crumbs=[['label' => 'Início', 'href' => '/'], ['label' => 'Achados e Perdidos']]}

    <div class="container-page py-8">
        <p class="mb-6 max-w-3xl text-slate-600">{$intro}</p>

        <ul class="grid gap-4 sm:grid-cols-2">
            {foreach $operadoras as $op}
                <li class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 class="mb-3 text-lg font-bold text-brand-700">{$op.nome}</h2>

                    <dl class="space-y-2.5 text-sm">
                        <div class="flex gap-2">
                            <dt class="pt-0.5">
                                <svg class="icone-info" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.386 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd"/></svg>
                                <span class="sr-only">Endereço</span>
                            </dt>
                            <dd class="text-slate-600">{$op.endereco}</dd>
                        </div>

                        <div class="flex gap-2">
                            <dt class="pt-0.5">
                                <svg class="icone-info" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 16.352V17.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clip-rule="evenodd"/></svg>
                                <span class="sr-only">Telefone</span>
                            </dt>
                            <dd class="flex flex-wrap items-center gap-x-2 gap-y-1">
                                {foreach $op.telefones as $i => $tel}
                                    <a href="{$tel|telhref}" class="font-medium text-brand-700 hover:underline">{$tel}</a>
                                    {if $i < count($op.telefones) - 1}<span class="text-slate-300" aria-hidden="true">·</span>{/if}
                                {/foreach}
                                {if $op.fax}<span class="text-slate-500">(Fax: {$op.fax})</span>{/if}
                            </dd>
                        </div>

                        <div class="flex gap-2">
                            <dt class="pt-0.5">
                                <svg class="icone-info" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.157 2.176a1.5 1.5 0 00-1.147 0l-4.084 1.69A1.5 1.5 0 002 5.244v9.812a1.5 1.5 0 002.074 1.386l3.51-1.453 4.26 1.763a1.5 1.5 0 001.146 0l4.083-1.69A1.5 1.5 0 0018 13.756V3.944a1.5 1.5 0 00-2.073-1.386l-3.51 1.452-4.26-1.834zM7.58 5a.75.75 0 01.75.75v6.5a.75.75 0 01-1.5 0v-6.5A.75.75 0 017.58 5zm5.59 2a.75.75 0 00-1.5 0v6.5a.75.75 0 001.5 0V7z" clip-rule="evenodd"/></svg>
                                <span class="sr-only">Região de atuação</span>
                            </dt>
                            <dd class="text-slate-600">{$op.regiao}</dd>
                        </div>
                    </dl>
                </li>
            {/foreach}
        </ul>
    </div>
{/block}

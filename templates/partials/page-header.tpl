{* Cabeçalho de página: breadcrumbs + título + descrição + slot extra. *}
<div class="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-slate-50">
    <div class="container-page py-8 md:py-10">
        {if $crumbs}{include 'partials/breadcrumbs.tpl' crumbs=$crumbs}{/if}
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{$titulo}</h1>
        {if $descricao}<p class="mt-2 max-w-2xl text-slate-600">{$descricao}</p>{/if}
    </div>
</div>

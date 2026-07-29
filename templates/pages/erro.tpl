{extends 'layout.tpl'}

{block 'conteudo'}
    <div class="container-page py-16 text-center">
        <p class="text-6xl font-bold text-brand-200">{$codigo ?: '404'}</p>
        <h1 class="mt-4 text-2xl font-bold text-slate-900">{$titulo}</h1>
        <p class="mx-auto mt-2 max-w-md text-slate-600">{$mensagem}</p>
        <a href="/" class="btn-primary mt-6">Voltar para a página inicial</a>
    </div>
{/block}

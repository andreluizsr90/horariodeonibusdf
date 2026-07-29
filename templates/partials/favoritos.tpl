{* Seção "Minhas Linhas Favoritas", carregada por fetch a partir dos slugs
   salvos no localStorage. Renderizada pelo SERVIDOR — o mesmo card usado nas
   listagens, sem markup duplicado em JavaScript. *}
{if count($linhas) > 0}
<div class="mb-4 flex items-center gap-2">
    <svg class="h-5 w-5 text-accent-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"/>
    </svg>
    <h2 id="favoritos-titulo" class="text-lg font-bold text-slate-900">Minhas Linhas Favoritas</h2>
    <span class="rounded-full bg-accent-500/20 px-2.5 py-0.5 text-xs font-semibold text-accent-600">{count($linhas)}</span>
</div>

<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {foreach $linhas as $linha}
        <li class="relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            data-linha data-semob="{$linha->semob ? '1' : '0'}">
            <div class="flex items-start gap-3 pr-9">
                <span class="linha-numero">{$linha->numero ?: '—'}</span>
                <span class="min-w-0">
                    <span class="block truncate font-semibold text-slate-800">{$linha->nome}</span>
                    {if $linha->subtitulo()}
                        <span class="mt-0.5 block truncate text-sm text-slate-500">{$linha->subtitulo()}</span>
                    {/if}
                </span>
            </div>

            {include 'partials/star.tpl' slug=$linha->slug numero=$linha->numero label=false class='absolute right-2 top-2'}

            <div class="mt-4 flex flex-wrap gap-2">
                <a href="/linhas/{$linha->slug|urlencode}" class="btn-primary">Ver Horários</a>
                {* "Ver Localização" só nas linhas Semob/DFTrans (com GPS). *}
                {if $linha->semob}
                    <a href="/linhas/{$linha->slug|urlencode}/localizacao"
                       class="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
                        <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500" aria-hidden="true"></span>
                        Ver Localização
                    </a>
                {/if}
            </div>
        </li>
    {/foreach}
</ul>
{/if}

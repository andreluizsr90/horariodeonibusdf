{* Card de uma linha — RENDERIZADO NO SERVIDOR (bom para SEO) e reutilizado
   por home, /linhas e /cidades/{slug}. $linha é um App\Domain\Linha. *}
<li class="relative" data-linha
    data-busca="{$linha->numero} {$linha->nome} {$linha->origem} {$linha->destino}"
    data-semob="{$linha->semob ? '1' : '0'}">
    <a href="/linhas/{$linha->slug|urlencode}" class="card group flex items-center gap-4 p-4 pr-12"
       aria-label="Ver detalhes da linha {$linha->numero} {$linha->nome}">
        <span class="linha-numero">{$linha->numero ?: '—'}</span>
        <span class="min-w-0">
            <span class="block truncate font-semibold text-slate-800 group-hover:text-brand-700">{$linha->nome}</span>
            {if $linha->subtitulo()}
                <span class="mt-0.5 block truncate text-sm text-slate-500">{$linha->subtitulo()}</span>
            {/if}
        </span>
    </a>
    {include 'partials/star.tpl' slug=$linha->slug numero=$linha->numero label=false class='absolute right-2 top-2'}
</li>

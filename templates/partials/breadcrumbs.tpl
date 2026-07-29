{* Trilha de navegação. $crumbs = [ {label, href?}, ... ] *}
<nav aria-label="Trilha de navegação" class="mb-3">
    <ol class="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        {foreach $crumbs as $i => $c}
            <li class="flex items-center gap-1.5">
                {if isset($c.href)}<a href="{$c.href}" class="transition hover:text-brand-700">{$c.label}</a>
                {else}<span aria-current="page" class="text-slate-700">{$c.label}</span>{/if}
                {if $i < count($crumbs) - 1}<span aria-hidden="true">/</span>{/if}
            </li>
        {/foreach}
    </ol>
</nav>

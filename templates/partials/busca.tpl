{* Busca de linhas. É um FORM real (GET /linhas?q=…): funciona sem JavaScript
   e os resultados são renderizados no servidor — indexáveis. O site.js
   adiciona filtro instantâneo dos cards já visíveis como melhoria. *}
<form action="/linhas" method="get" class="relative mb-6" data-busca-form>
    <label for="busca-linha" class="sr-only">Buscar linha de ônibus</label>
    <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>
    </span>
    <input id="busca-linha" name="q" type="search" value="{$valor}"
           placeholder="{$placeholder}" class="input-busca" aria-describedby="busca-status">
    <button type="submit" class="sr-only">Buscar</button>
</form>
<p id="busca-status" class="mb-4 text-sm text-slate-500" aria-live="polite">{$status}</p>

{* Botão de favoritar. O estado visual é aplicado pelo site.js a partir do
   localStorage (o servidor não conhece os favoritos do usuário). *}
<button type="button" data-fav-toggle data-fav-slug="{$slug}" data-fav-numero="{$numero}"
        aria-pressed="false" aria-label="Adicionar linha {$numero} aos favoritos"
        class="star-btn {$class ?: ''}">
    <svg class="star-icon h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path stroke-linejoin="round" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"/>
    </svg>
    {if $label}<span class="text-slate-700">Favoritar</span>{/if}
</button>

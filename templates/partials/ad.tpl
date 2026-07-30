{* Unidade AdSense. Cada requisição é um page view novo (MPA), então cada
   visualização já solicita um anúncio novo — sem truques de SPA. *}
{if $ads.client}
<div class="anuncio-limitado">
   <ins class="adsbygoogle block" style="display:block;width:100%;height:250px"
      data-ad-client="{$ads.client}"
      data-ad-slot="{$slot}"></ins>
   <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
{/if}

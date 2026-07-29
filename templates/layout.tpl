{* Layout global. Recebe: meta{}, site{}, ads{}, ga_id e o bloco "conteudo". *}
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#1d63f1">

    <title>{$meta.title}</title>
    <meta name="description" content="{$meta.description}">
    <link rel="canonical" href="{$meta.canonical}">
    <meta name="robots" content="{if $meta.noindex}noindex, nofollow{else}index, follow{/if}">

    <link rel="icon" href="/assets/img/logo-icon-horariodeonibusdf.png">
    <link rel="apple-touch-icon" href="/assets/img/icon-180.png">
    <link rel="manifest" href="/manifest.webmanifest">

    <meta property="og:site_name" content="{$site.name}">
    <meta property="og:title" content="{$meta.title}">
    <meta property="og:description" content="{$meta.description}">
    <meta property="og:url" content="{$meta.canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:image" content="{$site.url}/assets/img/logo-horariodeonibusdf.png">

    <link rel="stylesheet" href="{$assets.css}">

    {if $ads.client}
        <meta name="google-adsense-account" content="{$ads.client}">
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={$ads.client}" crossorigin="anonymous"></script>
    {/if}

    {block 'head'}{/block}
</head>
<body class="flex min-h-screen flex-col">
    <a href="#conteudo" class="skip-link">Pular para o conteúdo</a>

    {include 'partials/header.tpl'}

    <main id="conteudo" class="flex-1">
        {* Banner de topo — primeiro conteúdo abaixo do header. *}
        <div class="container-page pt-4" style="height: 250px; max-height: 250px;">{include 'partials/ad.tpl' slot='6961870453'}</div>

        {block 'conteudo'}{/block}
    </main>

    {include 'partials/footer.tpl'}

    <script src="{$assets.js}" defer></script>

    {if $ga_id}
        <script async src="https://www.googletagmanager.com/gtag/js?id={$ga_id}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', '{$ga_id}');
        </script>
    {/if}

    {block 'scripts'}{/block}
</body>
</html>

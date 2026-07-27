<?php
/**
 * Layout público global do site (Trongate template "public").
 *
 * Recebe do controller (via $data): title, description, canonical (caminho),
 * noindex (bool), view_module/view_file (a página) e os dados da página.
 *
 * Define render_ad_unit() para os blocos AdSense — como o Trongate é MPA
 * (cada navegação é um novo request), cada visualização já renderiza um
 * anúncio novo naturalmente ("um por visualização").
 */

if (!function_exists('render_ad_unit')) {
    function render_ad_unit(string $slot): void {
        if (ADSENSE_CLIENT === '') return; ?>
        <ins class="adsbygoogle" style="display:block"
             data-ad-client="<?= ADSENSE_CLIENT ?>"
             data-ad-slot="<?= $slot ?>"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        <?php
    }
}

$page_title = ($title ?? SITE_NAME) === SITE_NAME
    ? SITE_NAME . ' — Horários, Linhas e Itinerários'
    : ($title ?? '') . ' | ' . SITE_NAME;
$page_desc = $description ?? SITE_DESCRIPTION;
$canonical_url = SITE_URL . ($canonical ?? '/');
$is_noindex = !empty($noindex);
$nav = [
    ['label' => 'Página Inicial', 'href' => ''],
    ['label' => 'Cidades', 'href' => 'cidades'],
    ['label' => 'Achados e Perdidos', 'href' => 'achados-e-perdidos'],
];
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
    <base href="<?= BASE_URL ?>">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#1d63f1">
    <title><?= htmlspecialchars($page_title) ?></title>
    <meta name="description" content="<?= htmlspecialchars($page_desc) ?>">
    <link rel="canonical" href="<?= htmlspecialchars($canonical_url) ?>">
    <meta name="robots" content="<?= $is_noindex ? 'noindex, nofollow' : 'index, follow' ?>">
    <link rel="icon" href="<?= BASE_URL ?>assets/img/logo-icon-horariodeonibusdf.png">

    <!-- Open Graph -->
    <meta property="og:site_name" content="<?= htmlspecialchars(SITE_NAME) ?>">
    <meta property="og:title" content="<?= htmlspecialchars($page_title) ?>">
    <meta property="og:description" content="<?= htmlspecialchars($page_desc) ?>">
    <meta property="og:url" content="<?= htmlspecialchars($canonical_url) ?>">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:image" content="<?= SITE_URL ?>/assets/img/logo-horariodeonibusdf.png">

    <!-- Tailwind (Play CDN) — POC. Em produção, gerar CSS no build. -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: { extend: { colors: {
          brand: { 50:'#eef6ff',100:'#d9ebff',200:'#bcdcff',300:'#8ec6ff',400:'#59a6ff',500:'#3384fc',600:'#1d63f1',700:'#164ede',800:'#1840b4',900:'#1a3a8e',950:'#142456' },
          accent: { 400:'#ffc848',500:'#ffb020',600:'#e69100' }
        } } }
      };
    </script>
    <style type="text/tailwindcss">
      @layer components {
        .container-page { @apply mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8; }
        .card { @apply rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md; }
        .btn-primary { @apply inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700; }
      }
      body { @apply bg-slate-50 text-slate-800 antialiased; }
    </style>

    <?php if (ADSENSE_CLIENT !== ''): ?>
    <meta name="google-adsense-account" content="<?= ADSENSE_CLIENT ?>">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<?= ADSENSE_CLIENT ?>" crossorigin="anonymous"></script>
    <?php endif; ?>

    <?= $additional_includes_top ?? '' ?>
</head>
<body class="flex min-h-screen flex-col font-sans">
    <a href="#conteudo" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">Pular para o conteúdo</a>

    <!-- ==================== Header ==================== -->
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div class="container-page flex h-16 items-center justify-between gap-4">
            <a href="<?= BASE_URL ?>" class="flex shrink-0 items-center" aria-label="<?= htmlspecialchars(SITE_NAME) ?> — página inicial">
                <img src="<?= BASE_URL ?>assets/img/logo-horariodeonibusdf.png" alt="<?= htmlspecialchars(SITE_NAME) ?>" class="h-9 w-auto">
            </a>
            <nav class="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
                <?php foreach ($nav as $item): ?>
                    <a href="<?= BASE_URL . $item['href'] ?>" class="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"><?= $item['label'] ?></a>
                <?php endforeach; ?>
                <div class="relative" data-dropdown>
                    <button type="button" class="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700" data-dropdown-toggle aria-haspopup="menu" aria-expanded="false">
                        Tarifas
                        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
                    </button>
                    <div class="absolute right-0 top-full hidden w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg" data-dropdown-menu role="menu">
                        <a href="<?= BASE_URL ?>tarifas/distrito-federal" class="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700" role="menuitem">Distrito Federal</a>
                        <a href="<?= BASE_URL ?>tarifas/cidades-entorno" class="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700" role="menuitem">Cidades do Entorno</a>
                    </div>
                </div>
            </nav>
            <button type="button" class="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden" aria-label="Abrir menu" aria-expanded="false" data-mobile-toggle>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/></svg>
            </button>
        </div>
        <nav class="hidden border-t border-slate-200 bg-white md:hidden" aria-label="Navegação mobile" data-mobile-menu>
            <ul class="container-page flex flex-col py-2">
                <?php foreach ($nav as $item): ?>
                    <li><a href="<?= BASE_URL . $item['href'] ?>" class="block rounded-lg px-3 py-2.5 font-medium text-slate-700 hover:bg-brand-50"><?= $item['label'] ?></a></li>
                <?php endforeach; ?>
                <li><a href="<?= BASE_URL ?>tarifas/distrito-federal" class="block rounded-lg px-3 py-2.5 text-slate-700 hover:bg-brand-50">Tarifas — Distrito Federal</a></li>
                <li><a href="<?= BASE_URL ?>tarifas/cidades-entorno" class="block rounded-lg px-3 py-2.5 text-slate-700 hover:bg-brand-50">Tarifas — Cidades do Entorno</a></li>
            </ul>
        </nav>
    </header>

    <main id="conteudo" class="flex-1">
        <!-- Banner de topo — abaixo do header. -->
        <div class="container-page pt-4"><?php render_ad_unit('6961870453'); ?></div>

        <?= display($data) ?>

        <!-- Banner de rodapé — antes do footer. -->
        <div class="container-page py-6"><?php render_ad_unit('5989010611'); ?></div>
    </main>

    <!-- ==================== Footer ==================== -->
    <footer class="mt-auto border-t border-slate-200 bg-white">
        <div class="container-page py-6 text-center text-sm text-slate-500">
            &copy; <?= date('Y') ?> <?= htmlspecialchars(SITE_NAME) ?>. Todos os direitos reservados.
        </div>
    </footer>

    <script src="<?= BASE_URL ?>assets/js/site.js" defer></script>
    <?php if (GA_ID !== ''): ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?= GA_ID ?>"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','<?= GA_ID ?>');</script>
    <?php endif; ?>
    <?= $additional_includes_btm ?? '' ?>
</body>
</html>

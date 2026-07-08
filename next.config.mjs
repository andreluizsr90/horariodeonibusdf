/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gera o build "standalone" — copia apenas os arquivos necessários para rodar,
  // reduzindo drasticamente o tamanho da imagem Docker de produção.
  output: "standalone",

  reactStrictMode: true,
  poweredByHeader: false,

  // Redirecionamentos permanentes (301) para consolidar SEO das rotas alias
  // que NÃO possuem página própria de conteúdo. As rotas alias que devem
  // renderizar o mesmo conteúdo (ex.: /city) são tratadas como páginas reais
  // com <link rel="canonical"> apontando para a rota principal.
  async redirects() {
    return [];
  },

  images: {
    // Permite servir imagens remotas caso a API retorne URLs de imagens.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

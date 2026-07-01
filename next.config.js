/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Comprime e otimiza para produção na Hostinger (Node.js hosting)
  compress: true,
  // A Hostinger (hospedagem compartilhada) tem recursos apertados e roda o
  // `next build` no próprio servidor. Pular type-check e lint no build reduz
  // muito o consumo de CPU/memória/processos. A validação é feita LOCALMENTE
  // com `npm run build` antes de cada push — nunca subir sem buildar localmente.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

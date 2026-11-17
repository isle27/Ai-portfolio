import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  // Vercel inspects config before the production build as well as during it.
  // Use its standard directory in both phases; isolate local builds from dev.
  distDir:
    process.env.VERCEL === '1'
      ? '.next'
      : process.env.NODE_ENV === 'production'
        ? '.next-production'
        : '.next',
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
export default config;

/**
 * Content-Security-Policy.
 * 'unsafe-inline' op script/style is nodig voor Next.js' inline bootstrap +
 * Tailwind/styled inline styles (geen nonce-pipeline). Mollie-checkout is een
 * volledige redirect naar mollie.com (geen iframe/script), dus daar zijn geen
 * extra origins voor nodig. Supabase = auth + storage + (eventueel) realtime.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://sbsnl.nl https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // verberg de 'x-powered-by: Next.js' header
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'sbsnl.nl' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' }, // geüploade productfoto's (Supabase Storage)
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Canonical domein: www.smartbuystore.nl → smartbuystore.nl (308 permanent)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.smartbuystore.nl' }],
        destination: 'https://smartbuystore.nl/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

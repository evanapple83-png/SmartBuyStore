/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'sbsnl.nl' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' }, // geüploade productfoto's (Supabase Storage)
    ],
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

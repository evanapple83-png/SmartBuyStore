import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Privé/transactionele zones uit de index houden.
        disallow: ['/admin', '/account', '/zakelijk/portaal', '/checkout', '/api'],
      },
    ],
  };
}

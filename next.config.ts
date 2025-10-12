import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep config minimal to reduce function packaging surface
  
  // Rewrites to ensure /admin serves the Decap CMS static files
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: '/admin/index.html',
      },
    ];
  },
};

// Note: Sentry Webpack auto-wrapping of App Route handlers is disabled due to
// Cloudflare Pages / Next-on-Pages runtime issues. Sentry is still initialized
// via instrumentation files (instrumentation.ts and instrumentation-client.ts).
export default withContentlayer(nextConfig)
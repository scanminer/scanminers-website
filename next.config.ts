import { withContentlayer } from 'next-contentlayer'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

if (process.env.NODE_ENV !== 'production') {
  // Enables Cloudflare bindings (D1, etc.) inside `next dev`
  void initOpenNextCloudflareForDev()
}

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

  // Redirects for URL consistency
  async redirects() {
    return [
      {
        source: '/insights/using-lidar-for-tailings-dam-monitoring',
        destination: '/insights/using-lidar-for-tailing-dam-monitoring',
        permanent: true,
      },
    ];
  },
};

// Note: Sentry Webpack auto-wrapping of App Route handlers is disabled due to
// Cloudflare Pages / Next-on-Pages runtime issues. Sentry is still initialized
// via instrumentation files (instrumentation.ts and instrumentation-client.ts).
export default withContentlayer(nextConfig)
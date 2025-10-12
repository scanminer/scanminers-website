import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/case-studies/rss.xml', destination: '/case-studies/feed.xml', permanent: true },
      { source: '/insights/rss.xml', destination: '/insights/feed.xml', permanent: true },
    ];
  },
};

// Note: Sentry Webpack auto-wrapping of App Route handlers is disabled due to
// Cloudflare Pages / Next-on-Pages runtime issues. Sentry is still initialized
// via instrumentation files (instrumentation.ts and instrumentation-client.ts).
export default withContentlayer(nextConfig)
import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep config minimal to reduce function packaging surface
};

// Note: Sentry Webpack auto-wrapping of App Route handlers is disabled due to
// Cloudflare Pages / Next-on-Pages runtime issues. Sentry is still initialized
// via instrumentation files (instrumentation.ts and instrumentation-client.ts).
export default withContentlayer(nextConfig)
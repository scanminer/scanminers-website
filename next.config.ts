import { withContentlayer } from 'next-contentlayer'
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config options go here in the future
};

export default withSentryConfig(withContentlayer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "scanminers",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring", // Cloudflare Pages: ensure middleware does not match this path. Our middleware only matches /api/contact.

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Not applicable on Cloudflare Pages
  automaticVercelMonitors: false
});
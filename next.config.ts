import { withContentlayer } from 'next-contentlayer'
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config options go here in the future
};

export default withSentryConfig(withContentlayer(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
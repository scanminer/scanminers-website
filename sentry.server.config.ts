// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const getEnv = (k: string): string | undefined =>
  typeof process !== 'undefined' && process.env ? process.env[k] : undefined;

const isProd = getEnv('NODE_ENV') === 'production';

Sentry.init({
  dsn:
    getEnv('SENTRY_DSN') ||
    "https://f0c8defd247eec44b049aaa1ebdfa959@o4510172336291840.ingest.de.sentry.io/4510172344025168",

  // Lower tracing in production by default.
  tracesSampleRate: isProd ? 0.1 : 1,

  // Only enable internal SDK logs in development
  enableLogs: !isProd,

  debug: false,
});

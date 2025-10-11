// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  dsn:
    process.env.SENTRY_DSN ||
    "https://f0c8defd247eec44b049aaa1ebdfa959@o4510172336291840.ingest.de.sentry.io/4510172344025168",

  tracesSampleRate: isProd ? 0.1 : 1,
  enableLogs: !isProd,
  debug: false,
});

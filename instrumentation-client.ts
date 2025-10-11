// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    "https://f0c8defd247eec44b049aaa1ebdfa959@o4510172336291840.ingest.de.sentry.io/4510172344025168",

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Lower in production.
  tracesSampleRate: isProd ? 0.1 : 1,

  // Enable logs in development only
  enableLogs: !isProd,

  // Define how likely Replay events are sampled.
  // Keep lower session sample in production; capture all sessions on error.
  replaysSessionSampleRate: isProd ? 0.05 : 0.2,
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information while setting up Sentry.
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
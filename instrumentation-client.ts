// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Sentry client initialization is temporarily disabled to isolate production 500s.
export const onRouterTransitionStart = () => {}
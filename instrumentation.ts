import { logEnvWarnings } from "./lib/env";

export async function register() {
  // Early, lightweight environment validation (non-fatal) to aid configuration.
  try {
    logEnvWarnings();
  } catch (err) {
    // Never crash the app from instrumentation; just surface a warning.
    console.warn("[env] validation error", err);
  }
}

// Optional: define a minimal onRequestError without Sentry to avoid importing it on Edge
export function onRequestError() {
  // no-op; Sentry edge init is disabled for stability on Cloudflare Pages
}

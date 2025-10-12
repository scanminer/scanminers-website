export async function register() {
  // No-op: Sentry initialization removed to avoid bundling it into Edge functions.
}

// Optional: define a minimal onRequestError without Sentry to avoid importing it on Edge
export function onRequestError() {
  // no-op; Sentry edge init is disabled for stability on Cloudflare Pages
}

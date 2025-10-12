export async function register() {
  const rt = (typeof process !== 'undefined' && process.env && process.env.NEXT_RUNTIME) || 'edge'
  // Only initialize Sentry on nodejs runtime; skip on Edge (Cloudflare Pages) to avoid runtime issues.
  if (rt === 'nodejs') {
    await import('./sentry.server.config')
  }
}

// Optional: define a minimal onRequestError without Sentry to avoid importing it on Edge
export function onRequestError() {
  // no-op; Sentry edge init is disabled for stability on Cloudflare Pages
}

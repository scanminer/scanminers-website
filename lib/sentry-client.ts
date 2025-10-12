// lib/sentry-client.ts
import * as Sentry from '@sentry/browser'

export function initSentry() {
  if (typeof window === 'undefined') return
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return

  // Avoid re-initialization during HMR or repeated renders
  const g = globalThis as typeof globalThis & { __SENTRY_INIT__?: boolean }
  if (g.__SENTRY_INIT__) return

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [Sentry.replayIntegration()],
  })
  g.__SENTRY_INIT__ = true
}

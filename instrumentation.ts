import * as Sentry from '@sentry/nextjs';

export async function register() {
  const rt = (typeof process !== 'undefined' && process.env && process.env.NEXT_RUNTIME) || 'edge';
  if (rt === 'nodejs') {
    await import('./sentry.server.config');
  } else if (rt === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;

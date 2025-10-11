// Prefer env; in production, avoid localhost fallback to prevent invalid sitemap URLs
const DEFAULT_SITE = process.env.NODE_ENV === 'production' ? 'https://scanminers.com' : 'http://localhost:3000';
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE).replace(/\/$/, "");

export function absoluteUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${p}`;
}

## Scanminers Website

Production-ready Next.js 15 (App Router) site with MDX content (via Contentlayer), SEO (sitemap, robots, RSS), a Turnstile-protected contact form, and Cloudflare Pages deployment using Next on Pages.

## Quick start

1) Install dependencies

```bash
npm ci
```

2) Configure env vars

- Copy `.env.example` to `.env.local` and fill values.
- Required for local dev: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
- To enable email: `RESEND_API_KEY` (plus `RESEND_FROM`, `RESEND_TO`).
- Optional: `NEXT_PUBLIC_SITE_URL` for absolute URLs in metadata/sitemap.

3) Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Environment variables

See `.env.example` for the full list. These same keys should be added in Cloudflare Pages → Project settings → Environment variables (Production and Preview environments).

- NEXT_PUBLIC_TURNSTILE_SITE_KEY: Turnstile site key (public)
- TURNSTILE_SECRET_KEY: Turnstile secret key (server)
- RESEND_API_KEY: Resend API key (server)
- RESEND_FROM: Verified sender address (e.g., contact@yourdomain)
- RESEND_TO: One or more recipient emails (comma-separated)
- NEXT_PUBLIC_SITE_URL: Your site’s base URL (e.g., https://example.com)

## Contact form

- Page: `/contact`
- API route: `/api/contact` (Edge runtime)
- Validates and verifies Cloudflare Turnstile before sending an email via Resend’s REST API.

## Content and SEO

- MDX content via Contentlayer in `content/`
- RSS: `/insights/rss.xml`, `/case-studies/rss.xml`
- Sitemap: `/sitemap.xml`, Robots: `/robots.txt`

## Deploy: Cloudflare Pages

This repo is configured for Cloudflare Pages with Next on Pages.

- We include `.npmrc` and a `preinstall` script to ensure installs succeed with peer-deps.
- `wrangler.toml` enables `nodejs_compat` to satisfy Worker runtime warnings about Node built-ins.
- Dynamic routes export `runtime='edge'` to meet Next on Pages requirements.

### First-time setup

1) In Cloudflare Pages → Settings → Environment variables (for both Production and Preview):
	- NEXT_PUBLIC_TURNSTILE_SITE_KEY
	- TURNSTILE_SECRET_KEY
	- RESEND_API_KEY
	- RESEND_FROM (recommended)
	- RESEND_TO (recommended)
	- NEXT_PUBLIC_SITE_URL (recommended)

2) Trigger a new deploy by pushing to `main`.

## Rotating secrets (recommended)

If a secret is exposed or you wish to rotate periodically:

1) Cloudflare Turnstile: generate a new secret key in the dashboard. Update `TURNSTILE_SECRET_KEY` in Cloudflare Pages and your local `.env.local`.
2) Resend: create a new API key and revoke the old one. Update `RESEND_API_KEY` in Cloudflare Pages and `.env.local`.
3) If you changed `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, update both Cloudflare Pages and `.env.local`.
4) Redeploy to apply changes.

## Notes

- Generated artifacts from Contentlayer are ignored via `.gitignore`.
- Images used by MDX live in `public/`.

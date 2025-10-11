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
- RESEND_FROM: Verified sender address (e.g., contact@scanminers.com)
- RESEND_TO: One or more recipient emails (comma-separated), ex: founders@scanminers.com
- NEXT_PUBLIC_SITE_URL: Your site’s base URL (e.g., https://example.com)
	- Important: Set this in production so sitemap/OG URLs use your domain, not localhost.

## Contact form

- Page: `/contact`
- API route: `/api/contact` (Edge runtime)
- Validates and verifies Cloudflare Turnstile before sending an email via Resend’s REST API.

### Using contact@scanminers.com and founders@scanminers.com

Sending (Resend):
- Add your domain to Resend and complete domain verification (SPF/DKIM records).
- In Resend → Senders, add `contact@scanminers.com` and verify it (or verify the entire domain).
- Create an API key and set `RESEND_API_KEY` in Cloudflare Pages and `.env.local`.
- Set `RESEND_FROM=contact@scanminers.com` in env. The API route will fallback to this if `RESEND_FROM` is unset.

Receiving (Cloudflare Email Routing or your mailbox provider):
- If you don’t have a mailbox, use Cloudflare Email Routing:
	- Cloudflare dashboard → Email → Email Routing → Add `contact@scanminers.com` and `founders@scanminers.com`.
	- Create routing rules to forward incoming mail to your real inboxes (e.g., Gmail, Fastmail).
	- Alternatively, provision real mailboxes at your provider and point MX to that provider.

Production wiring:
- In Cloudflare Pages (Production + Preview envs):
	- RESEND_API_KEY, RESEND_FROM=contact@scanminers.com
	- RESEND_TO=founders@scanminers.com (or a comma-separated list)
	- NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, NEXT_PUBLIC_SITE_URL

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

## Dev Setup

1. `nvm use 20 && npm ci`
2. Create `.env.local` from `.env.example` and fill keys.
3. `npm run dev` (uses Webpack; Turbopack disabled for Contentlayer watch).
4. Content lives in `content/insights` and `content/case-studies` (MDX).
5. `npm run build` then `npm start` for a prod preview.

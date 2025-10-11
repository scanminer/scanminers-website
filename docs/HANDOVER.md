# Scanminers Website — Handover

Date: 2025-10-11
Maintainers: Scanminers Engineering

This handover consolidates architecture, environment, deployment, operations, security, and runbooks for the Scanminers website. It is suitable for converting to a PDF (see Export to PDF below).

---

## 1. System overview

- Framework: Next.js 15 (App Router), TypeScript, Tailwind v4
- Content: MDX via Contentlayer (Insights, Case Studies)
- SEO: Sitemap, robots, two RSS feeds
- Contact: Cloudflare Turnstile + Edge API route + Resend (REST) email
- Hosting: Cloudflare Pages (Next on Pages)
- Observability: Sentry (client/server/edge)
- Analytics: Optional Cloudflare Web Analytics (env-gated)

Top-level paths:
- Public pages: `/`, `/insights`, `/case-studies`, `/technologies`, `/contact`
- Content detail: `/insights/[slug]`, `/case-studies/[slug]`, tag pages
- SEO: `/sitemap.xml`, `/robots.txt`, `/insights/rss.xml`, `/case-studies/rss.xml`
- API: `/api/contact` (Edge), `/api/health` (Edge), `/api/health/env` (Edge)

---

## 2. Repository structure (key files)

- `app/` — App Router pages and API routes
  - `api/contact/route.ts` — Turnstile verify + email via Resend REST
  - `api/health/route.ts` — Minimal health check `{ ok: true, rev: 'Rev E' }`
  - `api/health/env/route.ts` — Returns booleans for env presence (no secret values)
  - `insights/`, `case-studies/` — Content-driven pages
  - `sentry-example-page/` — Triggers an error for Sentry validation
- `components/` — MDX renderers and contact form
- `content/` — MDX posts
- `lib/url.ts` — `absoluteUrl()` helper (uses NEXT_PUBLIC_SITE_URL; defaults to production domain in prod)
- `middleware.ts` — Simple IP-based rate limiting for `/api/contact`
- `.github/workflows/ci.yml` — CI: lint, typecheck, build on Node 20
- `sentry.*.config.ts` — Sentry init for client/server/edge
- `wrangler.toml` — Enables `nodejs_compat` for Workers
- `.env.example` — Env template
- `README.md` — Developer quickstart and deployment notes

---

## 3. Environments and configuration

Environment variables (Cloudflare Pages → Project settings → Environment variables; set for both Production and Preview):

Required for contact form:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile (public)
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile (secret)
- `RESEND_API_KEY` — Resend API key (secret)
- `RESEND_FROM` — Verified sender, e.g. `contact@scanminers.com`
- `RESEND_TO` — Comma-separated recipients, e.g. `founders@scanminers.com`

Recommended for SEO and analytics:
- `NEXT_PUBLIC_SITE_URL` — e.g. `https://scanminers.com` (prevents sitemap/OG localhost)
- `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` — Cloudflare Web Analytics (optional)

Sentry:
- `SENTRY_DSN` — Optional DSN to enable error reporting across runtimes

Local development:
- Copy `.env.example` → `.env.local` and fill values

---

## 4. Deployment (Cloudflare Pages)

- Use the Next.js preset in Cloudflare Pages
- Ensure Node.js compatibility is enabled (`wrangler.toml` and Pages setting)
- Avoid importing Node-only modules in Edge routes; use REST APIs instead (as with Resend)
- Dynamic routes export `export const runtime = 'edge'` where needed

CI: `.github/workflows/ci.yml` ensures lint, typecheck, and build run on push/PR

---

## 5. Email sending (Resend) and contact flow

Flow:
1. User submits `/contact` form with Turnstile widget
2. `app/api/contact/route.ts` verifies Turnstile on server
3. On success, composes and sends email via Resend REST API (Edge-safe)

Sender/recipient:
- Default sender fallback: `contact@scanminers.com`
- Configure `RESEND_FROM` and `RESEND_TO` in env for production

Resend setup:
- Verify domain and/or sender in Resend
- Create API key and set `RESEND_API_KEY`

---

## 6. Security and abuse mitigation

- CAPTCHA: Cloudflare Turnstile in contact form
- Rate limiting: Simple in-memory IP bucket in `middleware.ts` for `/api/contact` (20 req/min)
  - Note: In-memory and per-worker-instance; not a global limit. For stronger guarantees consider:
    - Cloudflare firewall/Rate Limiting rules
    - Durable Object-backed counters
- Secret handling: Env vars via Cloudflare Pages; do not log secret values
- Minimal env health check: `/api/health/env` returns booleans only
- Secrets rotation playbook:
  1) Create new Turnstile widget/secret or Resend API key
  2) Add new keys to Cloudflare Pages (keep old for one deploy)
  3) Deploy; verify
  4) Remove old keys

---

## 7. Observability and analytics

- Sentry: initialized for client/server/edge
  - Test via `/sentry-example-page` and verify event in Sentry
  - SDK suggests moving init into Next.js instrumentation if desired
- Cloudflare Web Analytics: add `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` to enable beacon in layout

### Sentry validation (runbook)
Pre-reqs:
- `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` configured in the target environment (local or Cloudflare Pages).

Steps:
1. Open `/sentry-example-page`.
2. Click “Throw Sample Error” to generate a client exception. The backend sample route (`/api/sentry-example-api`) is currently disabled to avoid a Next-on-Pages bundling error. You can reintroduce it under a different path if needed.
3. Confirm a frontend error in Sentry. If you reintroduce a backend route, you can validate a backend event as well.
4. If events don’t arrive:
   - Disable ad blockers; the `/monitoring` tunnel is configured but can still be blocked.
   - Verify DSNs match the Sentry project.
   - Ensure `/monitoring` is not intercepted by middleware or rewrites.
   - Check sampling; production defaults are lower.

---

## 8. Health and diagnostics

- `/api/health` — returns `{ ok: true, rev: 'Rev E' }`
- `/api/health/env` — returns `{ ok: boolean, details: { ...presence flags } }` (no values)

Manual checks:
- Submit contact form (expect success email to recipients)
- Review Cloudflare Pages logs for runtime errors
- Validate sitemap at `/sitemap.xml` and Search Console

---

## 9. Runbooks

Incident: Contact emails not arriving
- Check `/api/health/env` for `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO` presence
- Confirm Turnstile verification is passing (no 4xx from Turnstile API)
- Verify Resend status/dashboard for bounces or invalid sender
- Rotate `RESEND_API_KEY` and redeploy if suspected leak

Incident: Sitemap URLs wrong domain
- Ensure `NEXT_PUBLIC_SITE_URL` is set for Production and Preview
- `lib/url.ts` defaults to `https://scanminers.com` in production, but explicit env is preferred

Incident: Excessive spam through contact
- Raise Turnstile difficulty or enable Managed Challenge in Cloudflare
- Tighten rate limits via Cloudflare firewall rules
- Consider adding server-side content heuristics or email throttling

---

## 10. Versioning and release notes

- CHANGELOG is maintained in `CHANGELOG.md` (Keep a Changelog format)
- CI runs on every push/PR
- Releases can be tagged in Git as needed (no strict versioning required for this site)

---

## 11. Next steps (optional)

- Promote Sentry init to Next.js `instrumentation.ts` per SDK guidance
- Add stronger rate limiting (KV/Durable Object or Cloudflare Rules)
- Add e2e smoke tests for contact flow (Playwright) running in CI
- Add PostHog or similar privacy-friendly analytics if desired

---

## 12. Export to PDF

- From VS Code: Open this file → Print (⌘/Ctrl+P) → Print to PDF
- Or use `pandoc` locally to convert Markdown → PDF
  - Example: `pandoc docs/HANDOVER.md -o docs/HANDOVER.pdf`

---

## Appendix: Commands

- Install deps: `npm ci`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Start (prod preview): `npm start`

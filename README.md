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

### Glossary (Scanminers content flow)
- **Decap CMS** – Headless CMS at `/admin` for Briefs/edits.
- **Brief** – Short spec (frontmatter + notes) that seeds a draft.
- **Worker merges** – Auto-merge when `review_status: approved` and `publishedAt <= now`.
- **Insight / Case Study** – Long-form article types (different frontmatter).
- **Figures** – Mermaid (workflow) + Matplotlib (conceptual heatmaps), rendered to SVG.
- **Cover** – 16:9 WEBP via Stability AI, stored in `/public/images/uploads/`.

### Content flow (side-by-side)

| Step | Insight | Case Study | Brief |
|---|---|---|---|
| Create | CMS “New Brief” or `content/briefs/<slug>.md` | CMS “New Brief (case)” | CMS “New Brief” |
| Generate | `generate-draft-with-gpt.mjs` → `content/insights/<slug>/index.mdx` | same script → `content/case-studies/<slug>/index.mdx` | (A) publish short note OR (B) promote to Insight/Case via generator |
| Figures | Mermaid + Matplotlib SVGs | Mermaid timelines, optional Matplotlib | Optional (usually none) |
| Cover | Stability AI WEBP | Stability AI WEBP | Optional |
| Review/QA | PR + section/citation checks | PR + section/citation checks | Light review |
| Publish | Approve → auto-merge | Approve → auto-merge | Publish directly or promote |

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

---

Additional docs:
- Handover: `docs/HANDOVER.md`
- Changelog: `CHANGELOG.md`

## Brand Kit MVP

Tokens live in `design/brand.tokens.json` and are wired into Tailwind and utilities. This gives you consistent covers, figures, and UI without waiting on a full design system.

- Colors: bg, fg, primary (orange), accent (teal), muted, stroke
- Fonts: Inter (sans), JetBrains Mono (mono)
- Radii: sm/md/lg; Shadow: card

Usage:
- Tailwind: `bg-bg`, `text-fg`, `text-primary`, `shadow-card`, `rounded-mdx` (via `tailwind.config.ts`)
- CSS vars: `--brand-*` are defined in `app/globals.css`
- OG covers: Edge route `/og?title=...&kicker=Insights&colorway=slate-orange`

Frontmatter (optional):

```yaml
brand:
	colorway: "slate-orange"   # or "slate-teal"
	layout: "left-title"
```

Figure defaults (Matplotlib): generator injects `rcParams` so charts use brand bg/fg/muted by default.

### Voice & imagery

Voice: Clear, neutral, practitioner-first. Define acronyms on first use. Avoid hype; state uncertainty plainly.

Imagery:
- Prefer technical conceptual visuals (workflows, DoD heatmaps, change maps) over glossy marketing.
- If using generative art, keep it subtle (abstract geology textures, isometric tech motifs). Avoid photoreal mines without rights.
- Label conceptual figures: “Illustrative—no site data.”

Accessibility:
- Body text ≥ 16px; button/primary text contrast ≥ 4.5:1 on backgrounds.
- Don’t encode meaning by color alone; use shapes/labels in charts.

## Case Study specifics

Frontmatter template:

```yaml
---
title: "<Case Study: <Project/Asset>>"
slug: "<kebab-slug>"
client: "<redacted or name>"
provenance: "<internal/external/public>"
outcomes:
	- "<metric or qualitative outcome>"
	- "<e.g., earlier warnings or saved inspections>"
confidentiality: "public|client-approved|internal"
publishedAt: "YYYY-MM-DD"
tags: ["TSF","LiDAR","GISTM"]
review_status: "needs-review"
ai_generated: true
---
```

Prompt delta (add to the case-study user prompt):

```
Emphasize problem→approach→results→lessons learned. Include “Context, Objectives, Approach, Results, Lessons, Next Steps” sections. Use neutral tone; no vendor claims. Respect confidentiality and provenance.
```

## Generator troubleshooting

- Invalid JSON from GPT → re-run; for fast tests set `GENERATOR_MOCK_JSON=scripts/fixtures/lidar-mock.json`.
- PR not created → locally ensure `GH_TOKEN` has repo `contents` + `pull_requests`; in CI use `GITHUB_TOKEN` with `permissions: contents: write, pull-requests: write`.
- Mermaid CLI fails in CI → relies on fenced Mermaid fallback (client-side render).
- Matplotlib display error → set `MPLBACKEND=Agg` and pin versions (see CI workflow).
- Rate limit / 5xx → backoff retries are built-in; try again later if exhausted.
- Brief misrouted → ensure `status: New Brief` and your action filters avoid re-triggers.

### When to pick Brief A vs B

- A (publish brief as-is): quick research notes, link roundups, short updates.
- B (promote to long-form): stable outline + Source Pack ready → run the generator for full draft + figures/SEO.

## Image generation and regeneration

This repo includes automation to generate and regenerate cover images for posts.

- Generate draft from a brief: see `.github/workflows/generate-draft.yml`. The generator will create an MDX draft and a cover image, and persist the `imagePrompt` used in frontmatter.
- Regenerate a post image: run the workflow `.github/workflows/regenerate-image.yml` manually with inputs `post_slug` (e.g. `cobalt-in-battery-supply-chains`) and optional `prompt` to override. It opens a PR with the updated image and persists the last-used prompt to `imagePrompt`.

CMS button:
- In Decap CMS (`/admin` → Insights entry), use the "Regenerate Cover (AI)" button. You can optionally type a prompt override next to the button.
- The button calls an Edge API route at `/api/images/regenerate` which dispatches the GitHub workflow.

Required environment variables (Cloudflare Pages → Project settings → Environment variables):
- `ADMIN_ACTION_TOKEN`: a strong random string. Editors will paste it once in the CMS; it's sent as an auth header to the API route.
- One of the following for GitHub workflow dispatch from the API route:
	- `WORKFLOW_DISPATCH_TOKEN`: a fine-grained PAT with repo and workflow scopes; or
	- `CONTENT_BOT_TOKEN`: reuse the existing PAT used by generators.
- Optional for image generation service: `STABILITY_API_KEY` (required for actual generation in CI).

Notes:
- The CMS widget derives the slug from the entry's frontmatter or file path; if not found, it falls back to a title-based slug. Ensure the file name under `content/insights/` matches the slug of the post.
- The API route validates `x-admin-action-token` and returns 202 on success (queued). Check GitHub Actions for progress.

## Dev Setup

1. `nvm use 20 && npm ci`
2. Create `.env.local` from `.env.example` and fill keys.
3. `npm run dev` (uses Webpack; Turbopack disabled for Contentlayer watch).
4. Content lives in `content/insights` and `content/case-studies` (MDX).
5. `npm run build` then `npm start` for a prod preview.

## Sentry (error tracking)

This project includes Sentry for client, server, and edge runtimes. DSNs are read from env.

Env vars:
- `NEXT_PUBLIC_SENTRY_DSN` (browser; public)
- `SENTRY_DSN` (server/edge; secret)

Local test:
1. Add DSNs to `.env.local`.
2. `npm run dev` and open `http://localhost:3000/sentry-example-page`.
3. Click “Throw Sample Error”. This triggers a frontend error. Note: the sample backend route was disabled to avoid a Cloudflare Pages bundling issue.
4. Check your Sentry project for the events. If you see a connectivity warning, disable ad blockers. A tunnel route `/monitoring` is configured to help avoid blocking.

Production test:
1. Set the same env vars in Cloudflare Pages (Production and Preview).
2. After deploy, visit `/sentry-example-page` on your site and click the button.
3. Confirm events in Sentry. Sampling is lower in production by default; adjust in the Sentry config files if needed.

### Troubleshooting
- No events arriving:
	- Ensure `NEXT_PUBLIC_SENTRY_DSN` (client) and `SENTRY_DSN` (server/edge) are set in the environment used to run the app.
	- Try disabling ad blockers; while a tunnel route `/monitoring` is set up, some blockers may still interfere.
	- Check that your Sentry project and DSNs match the environment.
- Client errors blocked:
	- Verify that `/monitoring` isn’t matched by `middleware.ts` or other rewrites. Our middleware currently only matches `/api/contact`.
- Edge/server errors missing:
	- Confirm your failing route uses Edge or Node runtime and that `instrumentation.ts` is present at the repo root. We export `onRequestError` which should capture unhandled request errors.
- CSP/CORS issues:
	- If using a CSP, ensure Sentry ingest host and the tunnel path (`/monitoring`) are allowed.
- Sampling too low:
	- In production we lower tracing and replay session sampling. Adjust values in `sentry.server.config.ts`, `sentry.edge.config.ts`, and `instrumentation-client.ts`.
- Source maps / stack traces:
	- Source map upload is configured via `withSentryConfig` in `next.config.ts`. Ensure builds run in CI and network egress isn’t blocked. Check build logs for Sentry upload messages.

### Sentry smoke test (quick)
1. Ensure `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_DSN` are set (local or CF Pages).
2. Open `/sentry-example-page` and click “Throw Sample Error”.
3. Verify two events in Sentry: one frontend exception and one backend API request.
4. Optionally request `/monitoring` directly to verify the tunnel route responds (200/204); if blocked, try without ad blockers.

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
- Funnels: `/prospectivity-brief` (free lead magnet) and `/consultation` (paid intake) reuse the shared Turnstile + Resend stack and require billing vars for emails
- Hosting: Cloudflare Pages (Next on Pages)
- Observability: Sentry (client/server/edge)
- Analytics: Optional Cloudflare Web Analytics (env-gated)

Top-level paths:
- Public pages: `/`, `/insights`, `/case-studies`, `/technologies`, `/contact`
- Lead funnels: `/prospectivity-brief`, `/consultation`
- Content detail: `/insights/[slug]`, `/case-studies/[slug]`, tag pages
- SEO: `/sitemap.xml`, `/robots.txt`, `/insights/rss.xml`, `/case-studies/rss.xml`
- API: `/api/contact` (Edge), `/api/health` (Edge), `/api/health/env` (Edge)

---

## 2. Repository structure (key files)

- `app/` — App Router pages and API routes
  - `api/contact/route.ts` — Turnstile verify + email via Resend REST
  - `api/health/route.ts` — Minimal health check `{ ok: true, rev: 'Rev E' }`
  - `api/health/env/route.ts` — Returns booleans for env presence (no secret values)
  - `api/images/regenerate/route.ts` — Securely dispatches GitHub workflow to regenerate a post's cover image
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

Required for contact + prospectivity/consultation forms:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile (public)
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile (secret)
- `RESEND_API_KEY` — Resend API key (secret)
- `RESEND_FROM` — Verified sender, e.g. `contact@scanminers.com`
- `RESEND_TO` — Comma-separated recipients, e.g. `founders@scanminers.com`
- `CONSULT_BANK_ACCOUNT_NAME`, `CONSULT_BANK_ACCOUNT`, `CONSULT_BANK_IBAN`, `CONSULT_BANK_BIC`, `CONSULT_BANK_NOTE` — Included in consultation confirmation emails so buyers see wiring instructions

Recommended for SEO and analytics:
- `NEXT_PUBLIC_SITE_URL` — e.g. `https://scanminers.com` (prevents sitemap/OG localhost)
- `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` — Cloudflare Web Analytics (optional)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — GA4 measurement ID used by `lib/analytics.ts`

Sentry:
- `NEXT_PUBLIC_SENTRY_DSN` — Browser DSN (public)
- `SENTRY_DSN` — Server/edge DSN (secret)
- `SENTRY_ENVIRONMENT` — Optional label (e.g., production, preview)
Image generation & admin actions:
- `ADMIN_ACTION_TOKEN` — Required to authorize `/api/images/regenerate` from Decap. Use a strong random string and share with editors.
- `WORKFLOW_DISPATCH_TOKEN` — Fine-grained PAT with repo/workflow scope used by the API to call GitHub `workflow_dispatch`. Alternatively set `CONTENT_BOT_TOKEN` and the API will reuse it.
- `STABILITY_API_KEY` — Enables image generation in CI workflows and scripts.
- `SENTRY_DSN` — Optional DSN to enable error reporting across runtimes

Local development:
- Copy `.env.example` → `.env.local` and fill values

### 3.1 Admin portal & Decap CMS authentication (GitHub OAuth + NextAuth)

- The React admin portal (`/admin/login`) uses NextAuth with the GitHub provider. Only GitHub users in the allowlist (`ADMIN_ALLOWED_EMAILS`, `ADMIN_ALLOWED_EMAIL_DOMAINS`, `ADMIN_ALLOWED_GITHUB_LOGINS`) can sign in.
- Decap CMS at `/admin` reuses the same GitHub OAuth App via the edge endpoint `app/api/decap-auth/auth/route.ts`.
- Set `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`) in every environment so JWT cookies remain valid.
- Optional legacy password fallback exists for emergencies: set `ADMIN_PASS` and leave `ENABLE_ADMIN_PASSWORD_LOGIN=true`. Disable it (`false`) once everyone is on GitHub SSO. For local-only bypass you can set `ALLOW_ADMIN_WITHOUT_AUTH=true` (never enable that in production).

Cloudflare Pages → Environment variables (Production + Preview):

- `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET`
- `ADMIN_ALLOWED_EMAILS`, `ADMIN_ALLOWED_EMAIL_DOMAINS`, `ADMIN_ALLOWED_GITHUB_LOGINS`
- `NEXTAUTH_SECRET`
- (optional) `ADMIN_PASS`, `ENABLE_ADMIN_PASSWORD_LOGIN`, `ALLOW_ADMIN_WITHOUT_AUTH`

GitHub OAuth App (github.com → Settings → Developer settings → OAuth Apps):

- Homepage URL: `https://scanminers.com/admin` (or `https://scanminers.com`)
- Authorization callback URLs (add all that apply):
  - Production: `https://scanminers.com/api/decap-auth/auth`
  - Preview: `https://scanminers.pages.dev/api/decap-auth/auth`
  - Local dev: `http://localhost:3000/api/decap-auth/auth`

Notes:
- `public/admin/config.yml` → `backend.auth_endpoint: api/decap-auth/auth`; the runtime injects the current origin.
- Keep `backend.app_id` aligned with the GitHub OAuth Client ID for clarity.
- Test flow:
  1. Deploy with the env vars above.
  2. Visit `/admin/login` and sign in with GitHub. You should land on the React admin dashboard.
  3. Open `/admin` (Decap) in another tab; it will prompt the same GitHub OAuth flow and then load collections.
  4. If you hit “redirect URI mismatch,” double-check the OAuth App callback URLs for the domain you’re using (production vs preview vs local).

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
Incident: CMS "Regenerate Cover" button does nothing
- Ensure `ADMIN_ACTION_TOKEN` is set in Cloudflare Pages and that the editor pasted it once in the CMS prompt (stored in localStorage as `ADMIN_ACTION_TOKEN`).
- Ensure either `WORKFLOW_DISPATCH_TOKEN` or `CONTENT_BOT_TOKEN` is set in the environment so the API can call GitHub.
- Check Cloudflare Pages logs for `/api/images/regenerate` requests and response codes. 202 means queued; 401/500 indicates auth/config issues.
- Verify the GitHub Action "Regenerate Post Image" ran. If it failed, open the logs; confirm `STABILITY_API_KEY` is present if you expect image generation.

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

### 10.1 Branch protection and required checks

Protect `main` via GitHub → Settings → Branches → Add rule:

- Require pull request reviews (at least 1)
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict who can push (disable direct pushes)

Required checks to select (provided by `.github/workflows/checks.yml`):

- `build`
- `content:check`
- `lint`
- `test`
- `test:e2e`

Husky + lint-staged run locally to prevent low-quality commits. If you need to bypass hooks for emergency fixes, use `--no-verify` and follow up with a quality pass.

### 10.2 Tagging a baseline release
This project uses Decap CMS at `/admin` with a custom GitHub OAuth flow implemented at `app/api/decap-auth/auth/route.ts` (Edge runtime). It now uses NextAuth with the GitHub provider for multi-user SSO.
After merging significant changes, create a lightweight tag:

```
git checkout main
git pull --ff-only
git tag -a v0.1.0 -m "Baseline: stable content build, QA checks, tests, and CI checks"
git push origin v0.1.0
```

### 10.3 Solo maintainer mode

If only one maintainer has write access (no second reviewer), you can keep strict quality without approvals by enforcing checks and setting required approvals to 0.

Policy (recommended for solo):
- Keep required status checks: `build`, `content:check`, `lint`, `test`, `test:e2e` (strict/up-to-date)
- Set “required approving reviews” = 0
- Keep “enforce admins” enabled so rules apply to admins too

 
Cloudflare Pages → Environment variables (Production + Preview):

- `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET`
- `ADMIN_ALLOWED_EMAILS`, `ADMIN_ALLOWED_EMAIL_DOMAINS`, `ADMIN_ALLOWED_GITHUB_LOGINS`
- `NEXTAUTH_SECRET`
- (Optional) `ADMIN_PASS`, `ENABLE_ADMIN_PASSWORD_LOGIN`, `ALLOW_ADMIN_WITHOUT_AUTH`

GitHub OAuth App (github.com → Settings → Developer settings → OAuth Apps):

- Homepage URL: `https://scanminers.com/admin` (or `https://scanminers.com`)
- Authorization callback URLs:
  - Production: `https://scanminers.com/api/decap-auth/auth`
  - Preview: `https://scanminers.pages.dev/api/decap-auth/auth`
  - (Optional) Local: `http://localhost:3000/api/decap-auth/auth`

Notes:

- Decap’s `public/admin/config.yml` still points to `backend.auth_endpoint: api/decap-auth/auth`; the runtime injects the current origin.
- Update `backend.app_id` to match your GitHub OAuth Client ID for easy audits.
- Test flow:
  1. Deploy with the env vars above.
  2. Visit `/admin/login` and sign in with GitHub. You should land on the admin dashboard.
  3. Open `/admin` (Decap) in a new tab; it should reuse the same OAuth credentials.
  4. If you encounter “redirect URI mismatch,” ensure the exact Pages domain is listed in the OAuth App.
CLI example to toggle:

```
# Set approvals to 0 (solo mode)
gh api -X PUT repos/<owner>/<repo>/branches/main/protection -H "Accept: application/vnd.github+json" --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      {"context": "build"},
      {"context": "content:check"},
      {"context": "lint"},
      {"context": "test"},
      {"context": "test:e2e"}
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {"required_approving_review_count": 0},
  "restrictions": null
}
JSON

# Restore to 1 approval when a second reviewer is available
gh api -X PUT repos/<owner>/<repo>/branches/main/protection -H "Accept: application/vnd.github+json" --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      {"context": "build"},
      {"context": "content:check"},
      {"context": "lint"},
      {"context": "test"},
      {"context": "test:e2e"}
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {"required_approving_review_count": 1},
  "restrictions": null
}
JSON
```

Note: Even with 0 approvals, merges are still blocked until all required checks pass. This preserves build and content quality when you're solo.

---

## 11. Visual Components & Pages (MEGA-PROMPT 3)

### Mineral texture pack

- The geology-flavoured design system lives in `docs/mineral-texture-pack.md`.
- All canonical assets (18 minerals + neutral default) belong in `public/minerals/` as 1920×1080 WebP files. Use the prompts in the doc when regenerating.
- `lib/mineral-images.ts` now exports `MINERAL_TEXTURE_SPECS`, `getMineralTextureSpec`, and `getPreferredMineralTexture()` so automation/OG pipelines can stay in sync with creative direction.
- Editors should continue filling `imageMineral` in Contentlayer frontmatter; if omitted, the UI falls back to `getRandomMineralImage()` which still returns a safe placeholder.

### New Pages

#### `/technologies`
Comprehensive technology overview with:
- Hero section with HeroVisual component
- Multi-sensor fusion explanation (Optical, Hyperspectral, DEM, Geochemistry)
- Explainable AI section (XGBoost, Random Forest, SHAP)
- ProspectivityPipeline visualization
- Sustainability & SDG 13 alignment
- Product views integration

#### `/about`
Team and mission page featuring:
- Mission & vision with 3-pillar approach (Critical Minerals Security, Energy Transition, Responsible Exploration)
- Team profiles: Dr. Amin Beiranvand Pour (Co-Founder & Chief Scientist) and Mahmood Asadi (Co-Founder & Chief AI & Product Architect)
- Core principles: Scientific Rigor, Explainability, Collaboration, Climate Respect
- 3-step engagement workflow (Brief → Scoping → Advisory)
- CTAs to prospectivity brief and consultation forms

### Reusable Components

#### `components/HeroVisual.tsx`
Map-like satellite visualization with:
- Simulated satellite imagery background (SVG grid + gradients)
- Topographic contour overlays
- Commodity chips (Li, Co, Ni, REE, Cu, Graphite)
- Feature chips (Multi-sensor fusion, Explainable AI, SDG-aligned, Critical mineral targeting)
- Brand colors (sky/emerald gradients)
- Responsive: compact and full variants
- Animated data point indicators

#### `components/ProspectivityPipeline.tsx`
5-step workflow visualization:
- Step 1: **Ingest** (Database icon) - Multi-sensor data inputs
- Step 2: **Fuse** (GitMerge icon) - Data fusion and feature engineering
- Step 3: **Model** (BrainCircuit icon) - Explainable AI (XGBoost, RF, SHAP)
- Step 4: **Rank** (TrendingUp icon) - Prospectivity scoring
- Step 5: **Decide** (Target icon) - Drill targeting and field programs
- Desktop: horizontal with arrow connectors
- Mobile: vertical stacked with down arrows
- Color-coded cards with unique color per step

#### `components/ProductScreensStrip.tsx`
3-card product view showcase:
- **Prospectivity Map**: Heatmap visualization with hotspot identification
- **Explainability View**: SHAP feature importance charts (no black box)
- **Ranked Target List**: Sortable targets with scores and metadata
- Each card has icon, title, description, 3 bullets
- Placeholder visuals (gradients + grid overlays) for screenshots
- Ready to replace with actual product screenshots

### Homepage Integration

Updated `app/page.tsx` with:
- HeroVisual section after hero text with cross-links to `/technologies` and `/about`
- ProductScreensStrip section showcasing 3 product views
- ProspectivityPipeline replacing old operating stack for better visual hierarchy
- Maintained existing sections: hero, outcomes, critical coverage grid, funnels, latest content

### OG Image Generation

#### `scripts/generate-og-images.ts`
Automated OG image generation script:
- Iterates over published Insights and Case Studies
- Uses Stability AI Core API to generate 1200x630 images
- Generates prompts via `lib/og-prompts.ts` (geological/geospatial aesthetic)
- Saves to `public/og/<slug>.png`
- Skips existing files (use `--force` flag to regenerate)
- Run with: `npm run generate-og-images` (requires `STABILITY_API_KEY`)

#### `lib/og-prompts.ts`
OG image prompt generation:
- `generateOgImagePrompt()` - Creates 50-80 word prompts for Stability AI
- Incorporates title, region, commodities into geological visualization prompts
- Blue-green-amber color palette matching brand
- Focus: satellite imagery, topographic contours, heatmaps, data visualization
- No text, no people, no logos

#### `lib/og-metadata.ts`
OG metadata helpers for Next.js:
- `getOgImageUrl(slug)` - Returns absolute URL to generated OG image
- `getDefaultOgImageUrl()` - Fallback to default OG image
- `buildOgMetadata()` - Complete OpenGraph object with image
- `buildTwitterMetadata()` - Complete Twitter Card object with image
- Designed for build-time image generation (no runtime FS access on Cloudflare)

### Usage Example

To generate OG images for all published content:

```bash
# Set Stability AI API key
export STABILITY_API_KEY="sk-..."

# Generate images (skip existing)
npm run generate-og-images

# Force regenerate all
npm run generate-og-images --force
```

To use OG images in metadata:

```typescript
import { buildOgMetadata, buildTwitterMetadata } from "@/lib/og-metadata";

export const metadata: Metadata = {
  title: "My Post | Scanminers",
  description: "...",
  openGraph: buildOgMetadata({
    title: "My Post",
    description: "...",
    url: absoluteUrl("/insights/my-post"),
    slug: "my-post", // Uses /og/my-post.png
  }),
  twitter: buildTwitterMetadata({
    title: "My Post",
    description: "...",
    slug: "my-post",
  }),
};
```

### Design System Notes

All new components follow existing design patterns:
- Tailwind utilities with brand colors (primary, emerald, sky)
- Lucide React icons throughout
- Responsive breakpoints (sm, md, lg)
- Dark mode support via CSS variables
- Border radius: `rounded-xl` for cards, `rounded-2xl` for sections
- Shadows: `shadow-sm` to `shadow-lg` hierarchy
- Consistent spacing: `space-y-{n}` and `gap-{n}`
- Muted text: `text-muted-foreground`
- Typography: Font weights 400 (normal), 600 (semibold), 700 (bold)

To extend visuals:
- Add new data sources to `/technologies` multi-sensor fusion section
- Create additional product view cards in `ProductScreensStrip`
- Add more steps to `ProspectivityPipeline` if workflow changes
- Replace placeholder visuals in ProductScreensStrip with real screenshots (place in `public/images/screens/`)

---

## 12. Next steps (optional)

- Promote Sentry init to Next.js `instrumentation.ts` per SDK guidance
- Add stronger rate limiting (KV/Durable Object or Cloudflare Rules)
- Add e2e smoke tests for contact flow (Playwright) running in CI
- Add PostHog or similar privacy-friendly analytics if desired
- Replace ProductScreensStrip placeholder visuals with actual product screenshots
- Generate OG images for all existing content via generate-og-images script
- Add Stability AI API key to production environment for automated OG generation

---

## 13. Export to PDF

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

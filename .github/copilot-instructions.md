# Scanminers Website — AI Coding Instructions

## Architecture Overview

Next.js 15 (App Router) deployed on **Cloudflare Pages via OpenNext**. Key constraints:

- **Edge-first runtime**: API routes run on Cloudflare Workers; avoid Node.js-only modules
- **D1 database** for leads (`lib/lead-store.ts` → `LEADS_DB` binding in `wrangler.toml`)
- **Contentlayer** generates typed MDX content from `content/` → `.contentlayer/generated`

```
app/                      # App Router pages + API routes
├── api/                  # Edge API routes (contact, leads, admin, images)
├── admin/                # Protected admin dashboard (NextAuth + GitHub SSO)
├── solutions/            # Services/capabilities page
├── how-it-works/         # 5-step methodology page
├── insights/             # Contentlayer-backed blog
├── case-studies/         # Project showcases
content/                  # MDX source files
├── insights/             # Blog posts (*.mdx)
├── case-studies/         # Case study MDX
├── brand/                # Brand system content
lib/                      # Shared utilities
├── ai/                   # AI integrations (OpenAI, Perplexity)
├── brand-*.ts            # Brand system helpers
├── lead-store.ts         # D1 database access
├── mineral-images.ts     # Mineral texture system
components/               # React components
├── ui/                   # Primitives (Button, Card, Input)
├── marketing/            # Marketing components (hero, scroll-reveal)
database/migrations/      # D1 SQL migrations
```

## Essential Commands

```bash
npm ci                    # Install (uses --legacy-peer-deps via preinstall)
npm run dev               # Local dev (Turbopack disabled for Contentlayer)
npm run contentlayer      # Regenerate content types after MDX changes
npm run build             # Full build: contentlayer → next build → feeds → pagefind
npm run lint && npm run typecheck  # CI checks
npm test                  # Vitest (unit + integration)
npm run test:e2e          # Playwright E2E (builds then tests)
```

## Code Patterns

### API Routes

- All API routes are Edge-compatible by default (no `export const runtime` needed)
- Exception: `/api/auth/[...nextauth]/route.ts` uses `runtime = "nodejs"`
- Use Resend REST API directly, not the SDK (Edge-safe)
- Validate with Zod; see `app/api/contact/route.ts` for Turnstile + email pattern

### Content (MDX + Contentlayer)

- Add posts to `content/insights/` or `content/case-studies/` as `.mdx` files
- Run `npm run contentlayer` after adding/editing content
- Import types from `contentlayer/generated` (aliased in tsconfig)
- Filter content visibility with `filterVisibleContent()` from `lib/content-filters.ts`

### Brand & Design System

- Brand content lives in `content/brand/*.mdx`
- Use `buildBrandSystemPrompt()` from `lib/ai-brand.ts` for AI-generated copy
- Voice: confident, grounded, collaborative, technical B2B — no slang/emojis
- Mineral imagery via `lib/mineral-images.ts` — `getMineralImage()`, `getRandomMineralImage()`

### Styling

- Tailwind v4 with CSS-first config in `app/globals.css`
- Semantic tokens: `--bg`, `--fg`, `--primary`, `--secondary`, `--accent`
- Scanminers dark theme tokens: `--sm-bg`, `--sm-text`, `--sm-primary`, `--sm-surface`
- Dark mode via `next-themes`; prefer dark-first design

### Components

- UI primitives in `components/ui/` (Button, Card, Badge, Input)
- Marketing components in `components/marketing/` (ScrollReveal, FramedImage, HeroCinematic)
- Use `class-variance-authority` for variant patterns
- Animations: Framer Motion + `components/motion-primitives.tsx`

## D1 Database (Leads CRM)

```bash
# Local dev: wrangler creates .wrangler/state/v3/d1 automatically
wrangler d1 migrations apply scanminers-leads-v2 --local   # Apply locally
wrangler d1 migrations apply scanminers-leads-v2 --remote  # Apply to prod
```

Access via `getCloudflareContext()` from `@opennextjs/cloudflare` — see `lib/lead-store.ts`.

## Testing

- **Unit/Integration**: `tests/unit/`, `tests/integration/` → `npm test`
- **E2E**: `tests/e2e/` → `npm run test:e2e` (requires build)
- Path aliases: `@/` → project root (configured in `vitest.config.ts`)

## Environment Variables

Copy `.env.example` → `.env.local`. Critical vars:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` — Cloudflare CAPTCHA
- `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_TO` — Email
- `NEXTAUTH_SECRET`, `GITHUB_OAUTH_CLIENT_ID/SECRET` — Admin auth
- `OPENAI_API_KEY`, `PERPLEXITY_API_KEY` — AI features

For production, set in Cloudflare Pages dashboard (both Production + Preview).

## Admin Authentication

Middleware at `middleware.ts` guards `/admin/*` and `/api/admin/*`:

- Production: Requires NextAuth session with GitHub SSO
- Local dev: Set `ALLOW_ADMIN_WITHOUT_AUTH=true` to bypass (never in prod)
- Allowlists: `ADMIN_ALLOWED_EMAILS`, `ADMIN_ALLOWED_GITHUB_LOGINS`

## Deployment Notes

- Cloudflare Pages auto-deploys from `main` branch
- `wrangler.toml` configures D1 binding and `nodejs_compat` flag
- Static assets served from `.open-next/assets`
- Check `docs/HANDOVER.md` for complete ops runbook

## Scanminers Brain (Knowledge System)

AI-powered knowledge retrieval that relates leads to existing insights/case studies.

### Architecture

```
lib/scanminers-brain/
├── types.ts          # KnowledgeItem, BrainQuery, BrainResponse schemas
├── embeddings.ts     # OpenAI text-embedding-3-small wrapper
├── extraction.ts     # GPT-4 knowledge extraction from MDX
├── store.ts          # JSON file storage (data/scanminers-brain.json)
├── query.ts          # Similarity search + AI assessment
└── index.ts          # Public API barrel
```

### Commands

```bash
npm run brain:etl         # Extract knowledge from MDX → generate embeddings
npm run brain:etl:force   # Re-process all items (ignore existing)
```

### API

- `POST /api/scanminers-brain/related` — Query for related knowledge
- `GET /api/scanminers-brain/related` — Get store stats

### Usage in Admin

The `LeadBrainPanel` component on Lead detail pages queries the Brain API
and displays related knowledge items, AI assessment, risks, and next steps.

### Adding Knowledge Sources

1. Add MDX to `content/insights/` or `content/case-studies/`
2. Run `npm run brain:etl` to extract and embed
3. Knowledge is stored in `data/scanminers-brain.json`

- `wrangler.toml` configures D1 binding and `nodejs_compat` flag
- Static assets served from `.open-next/assets`
- Check `docs/HANDOVER.md` for complete ops runbook
- `wrangler.toml` configures D1 binding and `nodejs_compat` flag
- Static assets served from `.open-next/assets`
- Check `docs/HANDOVER.md` for complete ops runbook

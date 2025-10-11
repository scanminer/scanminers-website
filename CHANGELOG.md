# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres loosely to Semantic Versioning.

## [Unreleased]

## [2025-10-12]
### Changed
- Sentry: switch to env-based DSNs (`NEXT_PUBLIC_SENTRY_DSN` for client, `SENTRY_DSN` for server/edge) with sensible prod sampling (lower `tracesSampleRate`, lower `replaysSessionSampleRate`, logs disabled in prod)
- Disabled `automaticVercelMonitors` in `next.config.ts` (not applicable on Cloudflare Pages)
- Example page: removed `next/head` usage and added App Router `metadata.ts`

### Added
- `.env.example`: added `NEXT_PUBLIC_SENTRY_DSN` and clarified Sentry configuration variables

## [2025-10-11]
### Added
- Sentry integration across client/server/edge with example page and global error boundary
- Minimal Edge health endpoint at `/api/health`
- Environment health endpoint at `/api/health/env`
- Cloudflare Web Analytics (optional) via `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN`
- GitHub Actions CI workflow (lint, typecheck, build with Node 20)

### Changed
- Sitemap absolute URL generation: default to `https://scanminers.com` in production if `NEXT_PUBLIC_SITE_URL` is unset
- Contact email sender fallback to `contact@scanminers.com`
- Documentation: Added deployment/env guidelines, email setup for `contact@` and `founders@`, and Dev Setup section

### Fixed
- Adjusted Edge runtimes and removed conflicting SSG hooks for Cloudflare Pages compatibility
- Resolved ESLint issues in Sentry example and ensured successful build


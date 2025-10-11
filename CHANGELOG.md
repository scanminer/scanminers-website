# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres loosely to Semantic Versioning.

## [Unreleased]

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


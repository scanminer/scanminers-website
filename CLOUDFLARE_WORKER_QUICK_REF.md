# Quick Reference - Cloudflare Workers Configuration

## 🔧 Build Settings

```
Build command:  npx opennextjs-cloudflare build
Deploy command: npx opennextjs-cloudflare deploy
```

---

## 🏗️ Build Variables (5 total)

Set in: Settings → Build → **Build Variables**

```bash
NEXT_PUBLIC_SITE_URL=https://scanminers.com
NEXT_PUBLIC_GITHUB_REPO=scanminer/scanminers-website
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAB6CwlnnHkgvvHO7
NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN=EYcwK7fup8jrbRd9aomIdnui-8xxDsFhd6zX17la
NEXT_PUBLIC_SENTRY_DSN=https://b53612d82fc99224ef09db277d60ad97@o4510172336291840.ingest.de.sentry.io/4510172344025168
```

---

## 📦 Runtime Variables (14 total)

Set in: Settings → **Variables and Secrets** → Add Variable

```bash
ENABLE_INITIATE_API=false
GH_REPO=scanminer/scanminers-website
GIT_DEFAULT_BRANCH=main
CONTENT_AUTHOR_NAME=ScanminersBot
CONTENT_AUTHOR_EMAIL=bot@scanminers.com
SENTRY_ENVIRONMENT=production
PERPLEXITY_MODEL=sonar-pro
OPENAI_MODEL=gpt-4o
WEEKLY_TOKENS=6000
MONTHLY_TOKENS=20000
RESEND_FROM=contact@scanminers.com
RESEND_TO=founders@scanminers.com
ADMIN_USER=admin
GITHUB_OAUTH_CLIENT_ID=Ov23lidOWfKPNvTsn170
```

---

## 🔒 Runtime Secrets (10 total)

Set in: Settings → **Variables and Secrets** → Add Secret

```bash
TURNSTILE_SECRET_KEY=0x4AAAAAAB6CwvpKS4CKckRYyNENVwPfdLw
RESEND_API_KEY=re_c5xfWJps_7PTm2fJfpfei5dCPNsKf8TDy
ADMIN_ACTION_TOKEN=j6Oda9GKkkhbHACA6aoiZyq9ruOUztdY0ESE7zOpdNc=
PERPLEXITY_KEY=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
STABILITY_API_KEY=sk-zNEtXnhGbIzvlvY23BwNDvFaKv09pEPv9nIbzx3S94ZWzgNt
OPENAI_API_KEY=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
CONTENT_BOT_TOKEN=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
GH_TOKEN=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
GITHUB_OAUTH_CLIENT_SECRET=983369da48f5ec06899b3540030fbdf7f36f24dc
ADMIN_PASS=Kualalumpur123!
```

---

## 🌐 Custom Domains

Settings → Domains & Routes → **Custom Domains**

- `scanminers.com`
- `www.scanminers.com` (if used)

**Before adding:** Remove from Cloudflare Pages first!

---

## ✅ Minimum Required (Critical Path)

If short on time, set these first to get site working:

### Build Variables (2)
```
NEXT_PUBLIC_SITE_URL=https://scanminers.com
NEXT_PUBLIC_GITHUB_REPO=scanminer/scanminers-website
```

### Runtime Variables (1)
```
ENABLE_INITIATE_API=false
```

### Runtime Secrets (2)
```
GH_TOKEN=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
RESEND_API_KEY=re_c5xfWJps_7PTm2fJfpfei5dCPNsKf8TDy
```

Then add the rest incrementally.

---

## 🧪 Smoke Tests

After deploy:

```bash
# API gate (expect 403)
curl -i -X POST https://scanminers.com/api/initiate -H 'content-type: application/json' -d '{"title":"Test"}'

# Health (expect 200)
curl -i https://scanminers.com/api/health

# Assets (expect 200)
curl -I https://scanminers.com/images/og/using-lidar-for-tailing-dam-monitoring.png
```

**workers.dev subdomain:** `scanminers.{account}.workers.dev`

---

**Total: 29 variables to configure**

See `CLOUDFLARE_WORKER_SETUP.md` for detailed instructions.

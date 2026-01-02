# Brain v0 Provisioning Evidence

**Date**: 2026-01-02  
**Operator**: VEGA (via Principal supervision)  
**PR**: #102 (initial scaffold) + this patch (env strategy fix)

---

## Summary

All Cloudflare resources for Scanminers Brain v0 have been provisioned and verified.
This document serves as the audit trail required before deployment is considered shippable.

---

## 1. Environment Strategy

**Decision**: Option A (top-level = production)

| Environment | Deploy Command | Worker Name | Rationale |
|-------------|----------------|-------------|-----------|
| Production | `wrangler deploy` | `scanminers-brain` | No suffix, simpler routing |
| Staging | `wrangler deploy --env staging` | `scanminers-brain-staging` | Preview/dev |

**Note**: Secrets are NOT inherited between environments. Each env needs its own secret set:
- Production: `npx wrangler secret put BRAIN_REVIEWER_EMAIL`
- Staging: `npx wrangler secret put BRAIN_REVIEWER_EMAIL --env staging`

---

## 2. D1 Database

### Creation Receipt
```
Command: npx wrangler d1 create scanminers-brain --location weur
Result:
  - Database name: scanminers-brain
  - Database ID: c6a0a33f-4f08-4a01-b10a-15ebf01cd139
  - Location: Western Europe (WEUR)
```

### Migration Receipt
```
Command: npx wrangler d1 migrations apply BRAIN_DB --remote
Result:
  - Migration: 0001_brain_schema.sql
  - Commands executed: 26
  - Execution time: 4.21ms
  - Status: ✅ Applied
```

### DB-Touch Verification
```
Command: npx wrangler d1 execute BRAIN_DB --remote \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

Result (Tables):
┌───────────────────┐
│ name              │
├───────────────────┤
│ _cf_KV            │
│ claims            │
│ d1_migrations     │
│ hypotheses        │
│ hypothesis_claims │
│ sources           │
│ sqlite_sequence   │
│ workflow_events   │
└───────────────────┘

Command: npx wrangler d1 execute BRAIN_DB --remote \
  --command "SELECT name FROM sqlite_master WHERE type='view' ORDER BY name;"

Result (Views):
┌───────────────────────┐
│ name                  │
├───────────────────────┤
│ v_approved_claims     │
├───────────────────────┤
│ v_approved_hypotheses │
└───────────────────────┘
```

**Schema Objects**:
- 6 tables: `claims`, `hypotheses`, `hypothesis_claims`, `sources`, `workflow_events`, `d1_migrations`
- 2 views: `v_approved_claims`, `v_approved_hypotheses`
- System tables: `_cf_KV`, `sqlite_sequence`

---

## 3. R2 Bucket

### Creation Receipt
```
Command: npx wrangler r2 bucket create scanminers-evidence
Result:
  - Bucket name: scanminers-evidence
  - Status: ✅ Created
```

### Smoke Test
```
Command (PUT): echo "brain-provisioning-smoke-test-2026-01-02" | \
  npx wrangler r2 object put scanminers-evidence/smoke-test.txt --pipe
Result: Upload complete.

Command (GET): npx wrangler r2 object get scanminers-evidence/smoke-test.txt --pipe
Result: brain-provisioning-smoke-test-2026-01-02

Round-trip: ✅ Verified
```

---

## 4. Secrets

### Production (top-level, no --env flag)
```
Command: npx wrangler secret put BRAIN_REVIEWER_EMAIL
Value: amin80@gmail.com
Status: ✅ Set

Verify: npx wrangler secret list
Result: [{"name": "BRAIN_REVIEWER_EMAIL", "type": "secret_text"}]
```

### Note on Previous `--env production` Secret

During initial verification, a secret was mistakenly set with `--env production`, which created a separate Worker named `scanminers-brain-production`. This was cleaned up by adopting Option A (top-level = production).

**Action Required**: If `scanminers-brain-production` Worker exists, delete it via Cloudflare dashboard.

---

## 5. Verification Checklist

| Item | Status | Evidence |
|------|--------|----------|
| D1 database created | ✅ | ID: `c6a0a33f-4f08-4a01-b10a-15ebf01cd139` |
| D1 in WEUR region | ✅ | `--location weur` flag |
| Migration applied | ✅ | 26 commands, 4.21ms |
| Tables exist | ✅ | 6 tables in sqlite_master |
| Views exist | ✅ | 2 views (v_approved_*) |
| R2 bucket created | ✅ | `scanminers-evidence` |
| R2 smoke test | ✅ | put/get round-trip |
| Secret (production) | ✅ | `BRAIN_REVIEWER_EMAIL=amin80@gmail.com` |
| Env strategy locked | ✅ | Option A (top-level = production) |

---

## 6. Reviewer Authorization

**Canonical Reviewer**: Dr. Amin (amin80@gmail.com)  
**Auth Method**: Email-based via `BRAIN_REVIEWER_EMAIL` secret  
**Fallback**: userId match in `api-guard.ts`

---

## 7. Deployment Runbook

### First Deploy (Production)
```bash
cd workers/brain

# 1. Set secret (if not already set)
npx wrangler secret put BRAIN_REVIEWER_EMAIL
# Enter: amin80@gmail.com

# 2. Deploy to production
npx wrangler deploy

# 3. Verify deployment
curl https://scanminers-brain.<account>.workers.dev/health
```

### Staging Deploy (Optional)
```bash
cd workers/brain

# 1. Set secret for staging
npx wrangler secret put BRAIN_REVIEWER_EMAIL --env staging

# 2. Deploy to staging
npx wrangler deploy --env staging
```

---

## 8. Release Gate Status

**All P0 verification items: PASSED** ✅

The Brain Worker is ready for deployment after this PR merges.

---

*Evidence captured by VEGA • 2026-01-02*

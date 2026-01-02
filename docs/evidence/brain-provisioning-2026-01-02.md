# Brain v0 Provisioning Evidence

**Date**: 2026-01-02  
**Operator**: VEGA (via Principal supervision)  
**PR**: #102 (`feature/brain-v0-scaffold`)

## Summary

All Cloudflare resources for Scanminers Brain v0 have been provisioned and verified.
This document serves as the audit trail required before deployment is considered shippable.

---

## 1. D1 Database

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
│ v_approved_hypotheses │
└───────────────────────┘
```

**Schema Objects**:
- 6 tables: `claims`, `hypotheses`, `hypothesis_claims`, `sources`, `workflow_events`, `d1_migrations`
- 2 views: `v_approved_claims`, `v_approved_hypotheses`
- System tables: `_cf_KV`, `sqlite_sequence`

---

## 2. R2 Bucket

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

## 3. Secrets

### Default Environment
```
Command: npx wrangler secret list
Result: [{"name": "BRAIN_REVIEWER_EMAIL", "type": "secret_text"}]
Status: ✅ Set
```

### Production Environment
```
Command: npx wrangler secret list --env production
Initial Result: [] (empty - secrets not inherited)

Command: echo "amin80@gmail.com" | npx wrangler secret put BRAIN_REVIEWER_EMAIL --env production
Result: ✨ Success! Uploaded secret BRAIN_REVIEWER_EMAIL

Final Status: ✅ Set (amin80@gmail.com)
```

### Environment Binding Fix
```
Discovery: Cloudflare Worker environments do NOT inherit D1/R2 bindings from top-level config.
Warning observed: "d1_databases" exists at the top level, but not on "env.production"

Fix Applied: Added explicit bindings to wrangler.toml [env.production] section
  - [[env.production.d1_databases]] binding = "BRAIN_DB"
  - [[env.production.r2_buckets]] binding = "BRAIN_DOCS"

Commit: fix(brain): add D1/R2 bindings to production env
```

---

## 4. Wrangler Configuration

### Final wrangler.toml Bindings
```toml
# Top-level (default env)
[[d1_databases]]
binding = "BRAIN_DB"
database_name = "scanminers-brain"
database_id = "c6a0a33f-4f08-4a01-b10a-15ebf01cd139"

[[r2_buckets]]
binding = "BRAIN_DOCS"
bucket_name = "scanminers-evidence"

# Production environment (explicit, not inherited)
[[env.production.d1_databases]]
binding = "BRAIN_DB"
database_name = "scanminers-brain"
database_id = "c6a0a33f-4f08-4a01-b10a-15ebf01cd139"

[[env.production.r2_buckets]]
binding = "BRAIN_DOCS"
bucket_name = "scanminers-evidence"
```

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
| Secret (default) | ✅ | `BRAIN_REVIEWER_EMAIL` |
| Secret (production) | ✅ | `BRAIN_REVIEWER_EMAIL=amin80@gmail.com` |
| Production bindings | ✅ | wrangler.toml updated |

---

## 6. Reviewer Authorization

**Canonical Reviewer**: Dr. Amin (amin80@gmail.com)  
**Auth Method**: Email-based via `BRAIN_REVIEWER_EMAIL` secret  
**Fallback**: userId match in `api-guard.ts`

---

## 7. Release Gate Status

**All P0 verification items: PASSED** ✅

The Brain Worker is ready for deployment pending PR #102 merge.

---

*Evidence captured by VEGA • 2026-01-02*

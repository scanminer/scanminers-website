# Scanminers Brain v0 — Implementation Specification

**Date:** 2026-01-02  
**Status:** READY FOR IMPLEMENTATION  
**Ship Condition:** APPROVED-only claims; fail-closed workflow  
**No-Ship Condition:** Any endpoint returns non-APPROVED claims/hypotheses

---

## Architecture Context

### Binary Separation Compliance (DOCTRINE 001)

| Requirement | Implementation |
|-------------|----------------|
| **Pillar 1: Binary Split** | Brain lives in `scanminer/scanminers-website` repo, separate D1 binding (`BRAIN_DB`) |
| **Pillar 2: API-Only** | Brain endpoints are REST APIs consumed by admin UI; no shared ORM |
| **Pillar 3: Residency Buffer** | N/A for technical implementation |

(Source: `atlas/00_DOCTRINE/DOCTRINE_001_BINARY_SEPARATION.md`)

### Locked Decisions

| Item | Decision | Source |
|------|----------|--------|
| Region | Turkey (v0 only) | Unverified Hypothesis |
| Documents store | Cloudflare R2 | Unverified Hypothesis |
| Brain DB | Separate D1 binding (`BRAIN_DB`) | Unverified Hypothesis |
| v0 input types | Documents-only | SCANMINERS INTERNAL PLAYBOOK |

---

## P0-2: Evidence Pack Schema Invariants

### Database: `BRAIN_DB` (Cloudflare D1)

#### Table: `sources`

Admissible source documents.

```sql
CREATE TABLE sources (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Document identity
  doc_id TEXT NOT NULL UNIQUE,          -- Stable document identifier
  r2_key TEXT NOT NULL,                 -- R2 object key (immutable location)
  
  -- Bibliographic metadata
  title TEXT NOT NULL,
  author TEXT,
  year INTEGER,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'OFFICIAL_GEOLOGY_DATASET',
    'OFFICIAL_GEOLOGY_MAP',
    'PEER_REVIEWED',
    'OFFICIAL_SATELLITE_PRODUCT',
    'SATELLITE_METADATA',
    'EXPLORATION_REPORT'
  )),
  
  -- Provenance (required for exploration reports)
  provenance_statement TEXT,            -- Explicit provenance for exploration reports
  uncertainty_statement TEXT,           -- Required for exploration reports
  
  -- Audit
  ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
  ingested_by TEXT NOT NULL,
  
  -- Admissibility check
  is_admissible INTEGER NOT NULL DEFAULT 0,  -- 1 = passed source filter
  admissibility_reason TEXT
);

CREATE INDEX idx_sources_doc_id ON sources(doc_id);
CREATE INDEX idx_sources_r2_key ON sources(r2_key);
CREATE INDEX idx_sources_type ON sources(source_type);
```

(Source: Data Hierarchy for Critical Minerals Article 2)

#### Table: `claims`

Individual evidentiary claims extracted from sources.

```sql
CREATE TABLE claims (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Claim content
  claim_text TEXT NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN (
    'GEOLOGICAL_OBSERVATION',
    'MINERALOGICAL_OBSERVATION', 
    'GEOCHEMICAL_ANOMALY',
    'GEOPHYSICAL_ANOMALY',
    'SPECTRAL_SIGNATURE',
    'STRUCTURAL_FEATURE',
    'LITHOLOGICAL_UNIT',
    'ALTERATION_ZONE',
    'REMOTE_SENSING_DETECTION'
  )),
  
  -- Region constraint (v0 = Turkey only)
  region TEXT NOT NULL DEFAULT 'Turkey' CHECK (region = 'Turkey'),
  
  -- Evidence Pack: Source Reference (immutable pinning)
  source_id TEXT NOT NULL REFERENCES sources(id),
  excerpt TEXT NOT NULL,                         -- Direct quote from source
  excerpt_location_page TEXT,                    -- Page number(s)
  excerpt_location_figure TEXT,                  -- Figure/table reference
  excerpt_location_section TEXT,                 -- Section heading/number
  
  -- Evidence Pack: Method
  method TEXT NOT NULL,                          -- How was this derived?
  
  -- Evidence Pack: Uncertainty
  uncertainty_level TEXT NOT NULL CHECK (uncertainty_level IN ('LOW', 'MEDIUM', 'HIGH')),
  uncertainty_reasons TEXT NOT NULL,             -- JSON array of reasons
  
  -- Evidence Pack: Coordinates (when spatial)
  has_coordinates INTEGER NOT NULL DEFAULT 0,
  coord_type TEXT CHECK (coord_type IN ('POINT', 'BBOX') OR coord_type IS NULL),
  coord_lat REAL,                                -- WGS84 latitude (point center or bbox center)
  coord_lon REAL,                                -- WGS84 longitude
  coord_bbox_min_lat REAL,                       -- Bounding box (if applicable)
  coord_bbox_min_lon REAL,
  coord_bbox_max_lat REAL,
  coord_bbox_max_lon REAL,
  
  -- Workflow state (fail-closed)
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT',
    'REVIEW_READY',
    'APPROVED',
    'REJECTED',
    'INSUFFICIENT_EVIDENCE'
  )),
  
  -- Audit trail
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT NOT NULL,
  reviewed_at TEXT,
  reviewed_by TEXT,                              -- Must be Dr. Amin for APPROVED
  review_notes TEXT,
  
  -- Constraints
  CHECK (
    (has_coordinates = 0) OR 
    (has_coordinates = 1 AND coord_type IS NOT NULL AND coord_lat IS NOT NULL AND coord_lon IS NOT NULL)
  )
);

CREATE INDEX idx_claims_source ON claims(source_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_region ON claims(region);
CREATE INDEX idx_claims_type ON claims(claim_type);
```

(Source: SCANMINERS INTERNAL PLAYBOOK)

#### Table: `hypotheses`

Synthesized hypotheses linking multiple claims.

```sql
CREATE TABLE hypotheses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Hypothesis content
  hypothesis_text TEXT NOT NULL,
  hypothesis_type TEXT NOT NULL CHECK (hypothesis_type IN (
    'EXPLORATION_TARGET',
    'MINERAL_OCCURRENCE',
    'PROSPECTIVE_ZONE',
    'STRUCTURAL_CONTROL',
    'MINERALIZATION_MODEL'
  )),
  
  -- Region constraint
  region TEXT NOT NULL DEFAULT 'Turkey' CHECK (region = 'Turkey'),
  
  -- Uncertainty rollup
  uncertainty_level TEXT NOT NULL CHECK (uncertainty_level IN ('LOW', 'MEDIUM', 'HIGH')),
  uncertainty_reasons TEXT NOT NULL,             -- JSON array
  
  -- Coordinates (required for spatial hypotheses)
  has_coordinates INTEGER NOT NULL DEFAULT 0,
  coord_type TEXT CHECK (coord_type IN ('POINT', 'BBOX') OR coord_type IS NULL),
  coord_lat REAL,
  coord_lon REAL,
  coord_bbox_min_lat REAL,
  coord_bbox_min_lon REAL,
  coord_bbox_max_lat REAL,
  coord_bbox_max_lon REAL,
  
  -- Cross-check requirements (P0-5 mitigation)
  cross_checks TEXT NOT NULL DEFAULT '[]',       -- JSON array of cross-check descriptions
  failure_modes_screened TEXT NOT NULL DEFAULT '[]', -- JSON array of failure modes checked
  
  -- Workflow state (fail-closed)
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT',
    'REVIEW_READY',
    'APPROVED',
    'REJECTED',
    'INSUFFICIENT_EVIDENCE'
  )),
  
  -- Audit
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT NOT NULL,
  reviewed_at TEXT,
  reviewed_by TEXT,
  review_notes TEXT,
  
  CHECK (
    (has_coordinates = 0) OR 
    (has_coordinates = 1 AND coord_type IS NOT NULL AND coord_lat IS NOT NULL AND coord_lon IS NOT NULL)
  )
);

CREATE INDEX idx_hypotheses_status ON hypotheses(status);
CREATE INDEX idx_hypotheses_region ON hypotheses(region);
```

(Source: SCANMINERS INTERNAL PLAYBOOK, Common Failure Modes Article 9)

#### Table: `hypothesis_claims` (Junction)

Links hypotheses to supporting claims.

```sql
CREATE TABLE hypothesis_claims (
  hypothesis_id TEXT NOT NULL REFERENCES hypotheses(id) ON DELETE CASCADE,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('SUPPORTING', 'CROSS_CHECK', 'CONTRADICTING')),
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (hypothesis_id, claim_id)
);

CREATE INDEX idx_hc_hypothesis ON hypothesis_claims(hypothesis_id);
CREATE INDEX idx_hc_claim ON hypothesis_claims(claim_id);
```

#### Table: `workflow_events` (Audit Log)

Immutable log of all state transitions.

```sql
CREATE TABLE workflow_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('CLAIM', 'HYPOTHESIS')),
  entity_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_we_entity ON workflow_events(entity_type, entity_id);
CREATE INDEX idx_we_created ON workflow_events(created_at);
```

---

## P0-3: Fail-Closed Workflow + APPROVED-Only Serving

### State Machine

```
                    ┌──────────────────────────────┐
                    │                              │
                    ▼                              │
┌─────────┐   auto-check   ┌──────────────┐        │
│  DRAFT  │ ────────────►  │ REVIEW_READY │        │
└─────────┘    passes      └──────────────┘        │
     │                            │                │
     │                            │ Dr. Amin       │
     │                            │ reviews        │
     │                            ▼                │
     │              ┌─────────────────────────┐    │
     │              │                         │    │
     │         ┌────┴────┐  ┌─────────┐  ┌────┴────────────────┐
     │         │APPROVED │  │REJECTED │  │INSUFFICIENT_EVIDENCE│
     │         └─────────┘  └─────────┘  └─────────────────────┘
     │              │                              │
     │              │        can be revised        │
     └──────────────┴──────────────────────────────┘
```

### Auto-Check Rules (DRAFT → REVIEW_READY)

A claim/hypothesis can transition to REVIEW_READY **only if**:

```typescript
interface AutoCheckResult {
  passed: boolean;
  failures: string[];
}

function autoCheckClaim(claim: Claim): AutoCheckResult {
  const failures: string[] = [];
  
  // 1. Evidence Pack completeness
  if (!claim.excerpt?.trim()) failures.push('MISSING_EXCERPT');
  if (!claim.method?.trim()) failures.push('MISSING_METHOD');
  if (!claim.uncertainty_level) failures.push('MISSING_UNCERTAINTY_LEVEL');
  if (!claim.uncertainty_reasons?.length) failures.push('MISSING_UNCERTAINTY_REASONS');
  
  // 2. Source admissibility
  if (!claim.source?.is_admissible) failures.push('SOURCE_NOT_ADMISSIBLE');
  
  // 3. Location pinning
  if (!claim.excerpt_location_page && !claim.excerpt_location_figure && !claim.excerpt_location_section) {
    failures.push('MISSING_EXCERPT_LOCATION');
  }
  
  // 4. Coordinate validation (if spatial)
  if (claim.has_coordinates) {
    if (!isValidWGS84(claim.coord_lat, claim.coord_lon)) {
      failures.push('INVALID_COORDINATES');
    }
  }
  
  // 5. Region constraint (v0)
  if (claim.region !== 'Turkey') failures.push('REGION_NOT_TURKEY');
  
  return { passed: failures.length === 0, failures };
}

function autoCheckHypothesis(hypothesis: Hypothesis): AutoCheckResult {
  const failures: string[] = [];
  
  // 1. Must have supporting claims
  if (!hypothesis.claims?.filter(c => c.role === 'SUPPORTING').length) {
    failures.push('NO_SUPPORTING_CLAIMS');
  }
  
  // 2. All supporting claims must be APPROVED
  const nonApproved = hypothesis.claims
    ?.filter(c => c.role === 'SUPPORTING' && c.claim.status !== 'APPROVED');
  if (nonApproved?.length) failures.push('SUPPORTING_CLAIMS_NOT_APPROVED');
  
  // 3. Cross-check requirement (P0-5)
  const crossChecks = JSON.parse(hypothesis.cross_checks || '[]');
  if (crossChecks.length === 0) failures.push('NO_CROSS_CHECKS');
  
  // 4. Failure modes screened
  const failureModes = JSON.parse(hypothesis.failure_modes_screened || '[]');
  if (failureModes.length === 0) failures.push('NO_FAILURE_MODES_SCREENED');
  
  // 5. Region constraint
  if (hypothesis.region !== 'Turkey') failures.push('REGION_NOT_TURKEY');
  
  return { passed: failures.length === 0, failures };
}
```

(Source: How We Validate Remote-Sensing Leads Article 10)

### Approval Authority

| Action | Who Can Do It | Enforcement |
|--------|---------------|-------------|
| Create DRAFT | Any authenticated user | Auth middleware |
| Submit to REVIEW_READY | System (auto-check) | `autoCheck*()` functions |
| APPROVE | **Dr. Amin only** | `actor === 'dr.amin@scanminers.com'` check |
| REJECT | Dr. Amin only | Same as above |
| INSUFFICIENT_EVIDENCE | Dr. Amin only | Same as above |

### API Guardrails (APPROVED-Only Serving)

```typescript
// middleware/brain-api-guard.ts

export function approvedOnlyGuard<T extends { status: string }>(
  items: T[],
  includeEvidencePack: boolean = true
): T[] {
  // HARD FILTER: Only APPROVED items ever leave the API
  const approved = items.filter(item => item.status === 'APPROVED');
  
  if (!includeEvidencePack) {
    // Strip evidence pack for list views (optional optimization)
    return approved.map(item => ({
      ...item,
      excerpt: undefined,
      method: undefined,
    }));
  }
  
  return approved;
}

// Usage in API routes
export async function GET(request: Request) {
  const claims = await db.prepare('SELECT * FROM claims WHERE region = ?')
    .bind('Turkey')
    .all();
  
  // MANDATORY: All responses go through guard
  const response = approvedOnlyGuard(claims.results);
  
  return Response.json({
    data: response,
    meta: {
      total_approved: response.length,
      includes_evidence_pack: true,
    }
  });
}
```

(Source: SCANMINERS INTERNAL PLAYBOOK)

### API Response Schema (with Evidence Pack)

```typescript
interface ClaimAPIResponse {
  id: string;
  claim_text: string;
  claim_type: string;
  region: string;
  status: 'APPROVED';  // Always APPROVED in API response
  
  // Evidence Pack (always included)
  evidence_pack: {
    source: {
      doc_id: string;
      r2_key: string;
      title: string;
      author: string | null;
      year: number | null;
      source_type: string;
    };
    excerpt: string;
    excerpt_location: {
      page: string | null;
      figure: string | null;
      section: string | null;
    };
    method: string;
    uncertainty: {
      level: 'LOW' | 'MEDIUM' | 'HIGH';
      reasons: string[];
    };
    coordinates: {
      type: 'POINT' | 'BBOX' | null;
      lat: number | null;
      lon: number | null;
      bbox: {
        min_lat: number;
        min_lon: number;
        max_lat: number;
        max_lon: number;
      } | null;
    } | null;
  };
  
  // Audit
  reviewed_at: string;
  reviewed_by: string;
}
```

---

## P0-4: Source Admissibility Filter

### Admissible Source Types (v0)

| Source Type | Description | Requirements |
|-------------|-------------|--------------|
| `OFFICIAL_GEOLOGY_DATASET` | MTA, USGS, BGS official datasets | Must have DOI or official URL |
| `OFFICIAL_GEOLOGY_MAP` | Published geological maps | Must have scale, publication info |
| `PEER_REVIEWED` | Journal articles, conference papers | Must have DOI |
| `OFFICIAL_SATELLITE_PRODUCT` | Landsat, Sentinel, ASTER official products | Must have scene ID, acquisition date |
| `SATELLITE_METADATA` | Sensor specifications, calibration docs | Must be from official source |
| `EXPLORATION_REPORT` | Company reports, NI 43-101 | **Requires explicit provenance + uncertainty statements** |

(Source: Data Hierarchy for Critical Minerals Article 2)

### Admissibility Check Function

```typescript
function checkSourceAdmissibility(source: Source): { 
  admissible: boolean; 
  reason: string 
} {
  // Exploration reports have extra requirements
  if (source.source_type === 'EXPLORATION_REPORT') {
    if (!source.provenance_statement?.trim()) {
      return { 
        admissible: false, 
        reason: 'EXPLORATION_REPORT requires explicit provenance_statement' 
      };
    }
    if (!source.uncertainty_statement?.trim()) {
      return { 
        admissible: false, 
        reason: 'EXPLORATION_REPORT requires explicit uncertainty_statement' 
      };
    }
  }
  
  // All sources need basic metadata
  if (!source.title?.trim()) {
    return { admissible: false, reason: 'Missing title' };
  }
  
  if (!source.r2_key?.trim()) {
    return { admissible: false, reason: 'Document not uploaded to R2' };
  }
  
  return { admissible: true, reason: 'Passed admissibility check' };
}
```

---

## P0-5: Single-Layer False Positive Mitigation

### Required Cross-Checks

Before a hypothesis can reach `REVIEW_READY`, it must document:

1. **Cross-checks performed** (`cross_checks[]`):
   - At least one independent data source used to verify
   - Example: "Spectral anomaly cross-checked against known geology map"

2. **Failure modes screened** (`failure_modes_screened[]`):
   - At least one common failure mode explicitly ruled out
   - Example: "Ruled out vegetation false positive via NDVI analysis"

### Common Failure Modes to Screen (Reference)

| Failure Mode | Description | How to Screen |
|--------------|-------------|---------------|
| Vegetation masking | Vegetation signature mimics mineral | NDVI threshold check |
| Atmospheric artifacts | Haze/cloud contamination | QA band inspection |
| Sensor saturation | Bright targets cause overflow | Check for clipping |
| Topographic shadow | Shadow zones misidentified | DEM shadow mask |
| Water interference | Water bodies cause false anomalies | Water mask application |
| Processing artifacts | Striping, banding from sensor | Visual inspection |

(Source: Common Failure Modes in Remote-Sensing-Driven Targeting Article 9)

---

## Implementation Checklist

### Phase 1: Database Setup

- [ ] Add `BRAIN_DB` D1 binding to `wrangler.toml`
- [ ] Create migration `008_brain_schema.sql` with all tables above
- [ ] Run migration: `wrangler d1 migrations apply BRAIN_DB --remote`
- [ ] Verify tables exist

### Phase 2: Core Types + Validation

- [ ] Create `lib/brain/types.ts` with TypeScript interfaces
- [ ] Create `lib/brain/validation.ts` with auto-check functions
- [ ] Create `lib/brain/admissibility.ts` with source filter
- [ ] Add unit tests for validation logic

### Phase 3: API Routes

- [ ] `POST /api/brain/sources` - Ingest admissible source
- [ ] `POST /api/brain/claims` - Create claim (DRAFT)
- [ ] `POST /api/brain/claims/[id]/submit` - Auto-check → REVIEW_READY
- [ ] `POST /api/brain/claims/[id]/review` - Approve/Reject (Dr. Amin only)
- [ ] `GET /api/brain/claims` - List APPROVED claims with Evidence Pack
- [ ] Same pattern for hypotheses

### Phase 4: Admin UI

- [ ] Source ingestion form
- [ ] Claim creation form with Evidence Pack fields
- [ ] Hypothesis builder with claim linking
- [ ] Review queue for Dr. Amin
- [ ] APPROVED claims/hypotheses display

### Phase 5: Integration Tests

- [ ] Test: Cannot serve non-APPROVED claim via API
- [ ] Test: Cannot approve without Dr. Amin credentials
- [ ] Test: Cannot submit to REVIEW_READY without complete Evidence Pack
- [ ] Test: Hypothesis requires APPROVED supporting claims

---

## Deployment Notes

### wrangler.toml addition

```toml
[[d1_databases]]
binding = "BRAIN_DB"
database_name = "scanminers-brain"
database_id = "TBD_AFTER_CREATION"
```

### Environment Variables

| Variable | Purpose | Where Set |
|----------|---------|-----------|
| `BRAIN_REVIEWER_EMAIL` | Dr. Amin's email for approval auth | Cloudflare Dashboard |
| `R2_BUCKET_NAME` | Document storage bucket | Cloudflare Dashboard |
| `R2_ACCESS_KEY_ID` | R2 API access | Cloudflare Dashboard |
| `R2_SECRET_ACCESS_KEY` | R2 API secret | Cloudflare Dashboard |

---

## Risk Mitigations

| Risk | Mitigation | Enforcement |
|------|------------|-------------|
| Non-APPROVED data served | `approvedOnlyGuard()` in all API routes | Code review + E2E test |
| Unauthorized approval | Email check against `BRAIN_REVIEWER_EMAIL` | Middleware + audit log |
| Evidence Pack bypass | Schema-level NOT NULL constraints | D1 enforcement |
| Single-layer false positive | Required `cross_checks[]` before REVIEW_READY | Auto-check function |

---

## Report Metadata

- **Created:** 2026-01-02
- **Author:** FORGE (GitHub Copilot)
- **Based on:** SCANMINERS INTERNAL PLAYBOOK, Article 2, Article 9, Article 10
- **Compliance:** DOCTRINE 001 (Binary Separation)

---

**END OF SPECIFICATION**

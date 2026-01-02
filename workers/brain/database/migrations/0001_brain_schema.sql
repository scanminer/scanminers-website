-- Migration: 008_brain_schema.sql
-- Purpose: Scanminers Brain v0 - Evidence Pack + Approval Workflow
-- Date: 2026-01-02
-- Author: FORGE
-- 
-- INVARIANTS:
-- 1. All claims require complete Evidence Pack (excerpt, method, uncertainty)
-- 2. Only APPROVED claims/hypotheses served via API
-- 3. Region locked to 'Turkey' for v0
-- 4. Sources must pass admissibility check before claims can reference them

-- ============================================================================
-- TABLE: sources
-- Admissible source documents stored in R2
-- ============================================================================
CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Document identity (immutable pinning)
  doc_id TEXT NOT NULL UNIQUE,
  r2_key TEXT NOT NULL,
  
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
  
  -- Provenance (required for EXPLORATION_REPORT)
  provenance_statement TEXT,
  uncertainty_statement TEXT,
  
  -- Audit
  ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
  ingested_by TEXT NOT NULL,
  
  -- Admissibility gate
  is_admissible INTEGER NOT NULL DEFAULT 0,
  admissibility_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_sources_doc_id ON sources(doc_id);
CREATE INDEX IF NOT EXISTS idx_sources_r2_key ON sources(r2_key);
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(source_type);
CREATE INDEX IF NOT EXISTS idx_sources_admissible ON sources(is_admissible);

-- ============================================================================
-- TABLE: claims
-- Individual evidentiary claims with mandatory Evidence Pack
-- ============================================================================
CREATE TABLE IF NOT EXISTS claims (
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
  excerpt TEXT NOT NULL,
  excerpt_location_page TEXT,
  excerpt_location_figure TEXT,
  excerpt_location_section TEXT,
  
  -- Evidence Pack: Method
  method TEXT NOT NULL,
  
  -- Evidence Pack: Uncertainty
  uncertainty_level TEXT NOT NULL CHECK (uncertainty_level IN ('LOW', 'MEDIUM', 'HIGH')),
  uncertainty_reasons TEXT NOT NULL,
  
  -- Evidence Pack: Coordinates (WGS84)
  has_coordinates INTEGER NOT NULL DEFAULT 0,
  coord_type TEXT CHECK (coord_type IN ('POINT', 'BBOX') OR coord_type IS NULL),
  coord_lat REAL,
  coord_lon REAL,
  coord_bbox_min_lat REAL,
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
  reviewed_by TEXT,
  review_notes TEXT,
  
  -- Coordinate integrity constraint
  CHECK (
    (has_coordinates = 0) OR 
    (has_coordinates = 1 AND coord_type IS NOT NULL AND coord_lat IS NOT NULL AND coord_lon IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_claims_source ON claims(source_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_region ON claims(region);
CREATE INDEX IF NOT EXISTS idx_claims_type ON claims(claim_type);
-- Critical index for APPROVED-only serving
CREATE INDEX IF NOT EXISTS idx_claims_approved ON claims(status) WHERE status = 'APPROVED';

-- ============================================================================
-- TABLE: hypotheses
-- Synthesized hypotheses linking multiple claims
-- ============================================================================
CREATE TABLE IF NOT EXISTS hypotheses (
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
  uncertainty_reasons TEXT NOT NULL,
  
  -- Coordinates (WGS84)
  has_coordinates INTEGER NOT NULL DEFAULT 0,
  coord_type TEXT CHECK (coord_type IN ('POINT', 'BBOX') OR coord_type IS NULL),
  coord_lat REAL,
  coord_lon REAL,
  coord_bbox_min_lat REAL,
  coord_bbox_min_lon REAL,
  coord_bbox_max_lat REAL,
  coord_bbox_max_lon REAL,
  
  -- P0-5: Single-layer false positive mitigation
  cross_checks TEXT NOT NULL DEFAULT '[]',
  failure_modes_screened TEXT NOT NULL DEFAULT '[]',
  
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

CREATE INDEX IF NOT EXISTS idx_hypotheses_status ON hypotheses(status);
CREATE INDEX IF NOT EXISTS idx_hypotheses_region ON hypotheses(region);
CREATE INDEX IF NOT EXISTS idx_hypotheses_type ON hypotheses(hypothesis_type);
-- Critical index for APPROVED-only serving
CREATE INDEX IF NOT EXISTS idx_hypotheses_approved ON hypotheses(status) WHERE status = 'APPROVED';

-- ============================================================================
-- TABLE: hypothesis_claims (Junction)
-- Links hypotheses to supporting/cross-checking claims
-- ============================================================================
CREATE TABLE IF NOT EXISTS hypothesis_claims (
  hypothesis_id TEXT NOT NULL REFERENCES hypotheses(id) ON DELETE CASCADE,
  claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('SUPPORTING', 'CROSS_CHECK', 'CONTRADICTING')),
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (hypothesis_id, claim_id)
);

CREATE INDEX IF NOT EXISTS idx_hc_hypothesis ON hypothesis_claims(hypothesis_id);
CREATE INDEX IF NOT EXISTS idx_hc_claim ON hypothesis_claims(claim_id);

-- ============================================================================
-- TABLE: workflow_events (Audit Log)
-- Immutable log of all state transitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('SOURCE', 'CLAIM', 'HYPOTHESIS')),
  entity_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor TEXT NOT NULL,
  reason TEXT,
  auto_check_failures TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_we_entity ON workflow_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_we_created ON workflow_events(created_at);
CREATE INDEX IF NOT EXISTS idx_we_actor ON workflow_events(actor);

-- ============================================================================
-- VIEWS: APPROVED-only views for safe querying
-- ============================================================================

-- View: Only APPROVED claims with full Evidence Pack
CREATE VIEW IF NOT EXISTS v_approved_claims AS
SELECT 
  c.id,
  c.claim_text,
  c.claim_type,
  c.region,
  c.status,
  -- Source reference
  s.doc_id AS source_doc_id,
  s.r2_key AS source_r2_key,
  s.title AS source_title,
  s.author AS source_author,
  s.year AS source_year,
  s.source_type,
  -- Excerpt location
  c.excerpt,
  c.excerpt_location_page,
  c.excerpt_location_figure,
  c.excerpt_location_section,
  -- Method
  c.method,
  -- Uncertainty
  c.uncertainty_level,
  c.uncertainty_reasons,
  -- Coordinates
  c.has_coordinates,
  c.coord_type,
  c.coord_lat,
  c.coord_lon,
  c.coord_bbox_min_lat,
  c.coord_bbox_min_lon,
  c.coord_bbox_max_lat,
  c.coord_bbox_max_lon,
  -- Audit
  c.reviewed_at,
  c.reviewed_by
FROM claims c
JOIN sources s ON c.source_id = s.id
WHERE c.status = 'APPROVED';

-- View: Only APPROVED hypotheses
CREATE VIEW IF NOT EXISTS v_approved_hypotheses AS
SELECT 
  h.*,
  (SELECT COUNT(*) FROM hypothesis_claims hc WHERE hc.hypothesis_id = h.id AND hc.role = 'SUPPORTING') AS supporting_claims_count,
  (SELECT COUNT(*) FROM hypothesis_claims hc WHERE hc.hypothesis_id = h.id AND hc.role = 'CROSS_CHECK') AS cross_check_claims_count
FROM hypotheses h
WHERE h.status = 'APPROVED';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * Scanminers Brain v0 — TypeScript Types
 * 
 * INVARIANTS:
 * - All claims require complete Evidence Pack
 * - Only APPROVED claims/hypotheses served via API
 * - Region locked to 'Turkey' for v0
 * 
 * @module lib/brain/types
 */

// =============================================================================
// Enums
// =============================================================================

export const SOURCE_TYPES = [
  'OFFICIAL_GEOLOGY_DATASET',
  'OFFICIAL_GEOLOGY_MAP',
  'PEER_REVIEWED',
  'OFFICIAL_SATELLITE_PRODUCT',
  'SATELLITE_METADATA',
  'EXPLORATION_REPORT',
] as const;
export type SourceType = typeof SOURCE_TYPES[number];

export const CLAIM_TYPES = [
  'GEOLOGICAL_OBSERVATION',
  'MINERALOGICAL_OBSERVATION',
  'GEOCHEMICAL_ANOMALY',
  'GEOPHYSICAL_ANOMALY',
  'SPECTRAL_SIGNATURE',
  'STRUCTURAL_FEATURE',
  'LITHOLOGICAL_UNIT',
  'ALTERATION_ZONE',
  'REMOTE_SENSING_DETECTION',
] as const;
export type ClaimType = typeof CLAIM_TYPES[number];

export const HYPOTHESIS_TYPES = [
  'EXPLORATION_TARGET',
  'MINERAL_OCCURRENCE',
  'PROSPECTIVE_ZONE',
  'STRUCTURAL_CONTROL',
  'MINERALIZATION_MODEL',
] as const;
export type HypothesisType = typeof HYPOTHESIS_TYPES[number];

export const UNCERTAINTY_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type UncertaintyLevel = typeof UNCERTAINTY_LEVELS[number];

export const WORKFLOW_STATUSES = [
  'DRAFT',
  'REVIEW_READY',
  'APPROVED',
  'REJECTED',
  'INSUFFICIENT_EVIDENCE',
] as const;
export type WorkflowStatus = typeof WORKFLOW_STATUSES[number];

export const CLAIM_ROLES = ['SUPPORTING', 'CROSS_CHECK', 'CONTRADICTING'] as const;
export type ClaimRole = typeof CLAIM_ROLES[number];

export const COORD_TYPES = ['POINT', 'BBOX'] as const;
export type CoordType = typeof COORD_TYPES[number];

// =============================================================================
// Database Models
// =============================================================================

export interface Source {
  id: string;
  doc_id: string;
  r2_key: string;
  title: string;
  author: string | null;
  year: number | null;
  source_type: SourceType;
  provenance_statement: string | null;
  uncertainty_statement: string | null;
  ingested_at: string;
  ingested_by: string;
  is_admissible: 0 | 1;
  admissibility_reason: string | null;
}

export interface Claim {
  id: string;
  claim_text: string;
  claim_type: ClaimType;
  region: 'Turkey'; // v0 locked
  source_id: string;
  excerpt: string;
  excerpt_location_page: string | null;
  excerpt_location_figure: string | null;
  excerpt_location_section: string | null;
  method: string;
  uncertainty_level: UncertaintyLevel;
  uncertainty_reasons: string; // JSON array
  has_coordinates: 0 | 1;
  coord_type: CoordType | null;
  coord_lat: number | null;
  coord_lon: number | null;
  coord_bbox_min_lat: number | null;
  coord_bbox_min_lon: number | null;
  coord_bbox_max_lat: number | null;
  coord_bbox_max_lon: number | null;
  status: WorkflowStatus;
  created_at: string;
  created_by: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
}

export interface Hypothesis {
  id: string;
  hypothesis_text: string;
  hypothesis_type: HypothesisType;
  region: 'Turkey'; // v0 locked
  uncertainty_level: UncertaintyLevel;
  uncertainty_reasons: string; // JSON array
  has_coordinates: 0 | 1;
  coord_type: CoordType | null;
  coord_lat: number | null;
  coord_lon: number | null;
  coord_bbox_min_lat: number | null;
  coord_bbox_min_lon: number | null;
  coord_bbox_max_lat: number | null;
  coord_bbox_max_lon: number | null;
  cross_checks: string; // JSON array
  failure_modes_screened: string; // JSON array
  status: WorkflowStatus;
  created_at: string;
  created_by: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
}

export interface HypothesisClaim {
  hypothesis_id: string;
  claim_id: string;
  role: ClaimRole;
  added_at: string;
}

export interface WorkflowEvent {
  id: string;
  entity_type: 'SOURCE' | 'CLAIM' | 'HYPOTHESIS';
  entity_id: string;
  from_status: WorkflowStatus | null;
  to_status: WorkflowStatus;
  actor: string;
  reason: string | null;
  auto_check_failures: string | null; // JSON array
  created_at: string;
}

// =============================================================================
// API Response Types (Evidence Pack always included)
// =============================================================================

export interface EvidencePack {
  source: {
    doc_id: string;
    r2_key: string;
    title: string;
    author: string | null;
    year: number | null;
    source_type: SourceType;
  };
  excerpt: string;
  excerpt_location: {
    page: string | null;
    figure: string | null;
    section: string | null;
  };
  method: string;
  uncertainty: {
    level: UncertaintyLevel;
    reasons: string[];
  };
  coordinates: {
    type: CoordType;
    lat: number;
    lon: number;
    bbox: {
      min_lat: number;
      min_lon: number;
      max_lat: number;
      max_lon: number;
    } | null;
  } | null;
}

export interface ClaimAPIResponse {
  id: string;
  claim_text: string;
  claim_type: ClaimType;
  region: 'Turkey';
  status: 'APPROVED'; // Always APPROVED in API response
  evidence_pack: EvidencePack;
  reviewed_at: string;
  reviewed_by: string;
}

export interface HypothesisAPIResponse {
  id: string;
  hypothesis_text: string;
  hypothesis_type: HypothesisType;
  region: 'Turkey';
  status: 'APPROVED'; // Always APPROVED in API response
  uncertainty: {
    level: UncertaintyLevel;
    reasons: string[];
  };
  coordinates: EvidencePack['coordinates'];
  cross_checks: string[];
  failure_modes_screened: string[];
  supporting_claims: ClaimAPIResponse[];
  cross_check_claims: ClaimAPIResponse[];
  reviewed_at: string;
  reviewed_by: string;
}

// =============================================================================
// Input Types (for creating/updating)
// =============================================================================

export interface CreateSourceInput {
  doc_id: string;
  r2_key: string;
  title: string;
  author?: string;
  year?: number;
  source_type: SourceType;
  provenance_statement?: string;
  uncertainty_statement?: string;
}

export interface CreateClaimInput {
  claim_text: string;
  claim_type: ClaimType;
  source_id: string;
  excerpt: string;
  excerpt_location_page?: string;
  excerpt_location_figure?: string;
  excerpt_location_section?: string;
  method: string;
  uncertainty_level: UncertaintyLevel;
  uncertainty_reasons: string[];
  coordinates?: {
    type: CoordType;
    lat: number;
    lon: number;
    bbox?: {
      min_lat: number;
      min_lon: number;
      max_lat: number;
      max_lon: number;
    };
  };
}

export interface CreateHypothesisInput {
  hypothesis_text: string;
  hypothesis_type: HypothesisType;
  uncertainty_level: UncertaintyLevel;
  uncertainty_reasons: string[];
  coordinates?: {
    type: CoordType;
    lat: number;
    lon: number;
    bbox?: {
      min_lat: number;
      min_lon: number;
      max_lat: number;
      max_lon: number;
    };
  };
  supporting_claim_ids: string[];
  cross_check_claim_ids?: string[];
  cross_checks: string[];
  failure_modes_screened: string[];
}

export interface ReviewInput {
  decision: 'APPROVED' | 'REJECTED' | 'INSUFFICIENT_EVIDENCE';
  notes?: string;
}

// =============================================================================
// Validation Result Types
// =============================================================================

export interface AutoCheckResult {
  passed: boolean;
  failures: AutoCheckFailure[];
}

export type AutoCheckFailure =
  | 'MISSING_EXCERPT'
  | 'MISSING_METHOD'
  | 'MISSING_UNCERTAINTY_LEVEL'
  | 'MISSING_UNCERTAINTY_REASONS'
  | 'SOURCE_NOT_ADMISSIBLE'
  | 'MISSING_EXCERPT_LOCATION'
  | 'INVALID_COORDINATES'
  | 'REGION_NOT_TURKEY'
  | 'NO_SUPPORTING_CLAIMS'
  | 'SUPPORTING_CLAIMS_NOT_APPROVED'
  | 'NO_CROSS_CHECKS'
  | 'NO_FAILURE_MODES_SCREENED';

export interface AdmissibilityResult {
  admissible: boolean;
  reason: string;
}

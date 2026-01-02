/**
 * Scanminers Brain v0 — Validation & Auto-Check
 * 
 * Implements the fail-closed workflow:
 * DRAFT → REVIEW_READY (auto-check passes) → APPROVED/REJECTED/INSUFFICIENT_EVIDENCE
 * 
 * Auto-check enforces Evidence Pack completeness before human review.
 * 
 * @module lib/brain/validation
 */

import type {
  Claim,
  Hypothesis,
  Source,
  AutoCheckResult,
  AutoCheckFailure,
  AdmissibilityResult,
  CreateClaimInput,
  CreateHypothesisInput,
  CreateSourceInput,
} from './types';

// =============================================================================
// Source Admissibility Check (P0-4)
// =============================================================================

/**
 * Checks if a source meets admissibility criteria for v0.
 * 
 * Admissible sources (v0):
 * - Official geology datasets/maps
 * - Peer-reviewed publications
 * - Official satellite products/metadata
 * - Exploration reports (with explicit provenance + uncertainty)
 */
export function checkSourceAdmissibility(source: Source | CreateSourceInput): AdmissibilityResult {
  // Basic metadata required for all sources
  if (!source.title?.trim()) {
    return { admissible: false, reason: 'Missing required field: title' };
  }

  if (!source.r2_key?.trim()) {
    return { admissible: false, reason: 'Document not uploaded to R2 (missing r2_key)' };
  }

  if (!source.doc_id?.trim()) {
    return { admissible: false, reason: 'Missing required field: doc_id' };
  }

  // Exploration reports have extra requirements
  if (source.source_type === 'EXPLORATION_REPORT') {
    if (!source.provenance_statement?.trim()) {
      return {
        admissible: false,
        reason: 'EXPLORATION_REPORT requires explicit provenance_statement',
      };
    }
    if (!source.uncertainty_statement?.trim()) {
      return {
        admissible: false,
        reason: 'EXPLORATION_REPORT requires explicit uncertainty_statement',
      };
    }
  }

  return { admissible: true, reason: 'Passed admissibility check' };
}

// =============================================================================
// Claim Auto-Check (DRAFT → REVIEW_READY gate)
// =============================================================================

/**
 * Auto-check for claims before transitioning to REVIEW_READY.
 * 
 * Validates Evidence Pack completeness:
 * - excerpt (non-empty)
 * - method (non-empty)
 * - uncertainty_level (LOW/MEDIUM/HIGH)
 * - uncertainty_reasons (non-empty array)
 * - source admissibility
 * - excerpt location (at least one of page/figure/section)
 * - coordinates validity (if spatial)
 * - region = Turkey (v0)
 */
export function autoCheckClaim(
  claim: Claim | CreateClaimInput,
  source: Source | null
): AutoCheckResult {
  const failures: AutoCheckFailure[] = [];

  // 1. Evidence Pack: Excerpt
  const excerpt = 'excerpt' in claim ? claim.excerpt : null;
  if (!excerpt?.trim()) {
    failures.push('MISSING_EXCERPT');
  }

  // 2. Evidence Pack: Method
  const method = 'method' in claim ? claim.method : null;
  if (!method?.trim()) {
    failures.push('MISSING_METHOD');
  }

  // 3. Evidence Pack: Uncertainty Level
  const uncertaintyLevel = 'uncertainty_level' in claim ? claim.uncertainty_level : null;
  if (!uncertaintyLevel) {
    failures.push('MISSING_UNCERTAINTY_LEVEL');
  }

  // 4. Evidence Pack: Uncertainty Reasons
  let uncertaintyReasons: string[] = [];
  if ('uncertainty_reasons' in claim) {
    if (typeof claim.uncertainty_reasons === 'string') {
      try {
        uncertaintyReasons = JSON.parse(claim.uncertainty_reasons);
      } catch {
        uncertaintyReasons = [];
      }
    } else if (Array.isArray(claim.uncertainty_reasons)) {
      uncertaintyReasons = claim.uncertainty_reasons;
    }
  }
  if (!uncertaintyReasons.length) {
    failures.push('MISSING_UNCERTAINTY_REASONS');
  }

  // 5. Source Admissibility
  if (!source) {
    failures.push('SOURCE_NOT_ADMISSIBLE');
  } else if ('is_admissible' in source && !source.is_admissible) {
    failures.push('SOURCE_NOT_ADMISSIBLE');
  }

  // 6. Excerpt Location (at least one must be present)
  const hasPage = 'excerpt_location_page' in claim && claim.excerpt_location_page?.trim();
  const hasFigure = 'excerpt_location_figure' in claim && claim.excerpt_location_figure?.trim();
  const hasSection = 'excerpt_location_section' in claim && claim.excerpt_location_section?.trim();
  if (!hasPage && !hasFigure && !hasSection) {
    failures.push('MISSING_EXCERPT_LOCATION');
  }

  // 7. Coordinates (if spatial)
  const hasCoords = 'has_coordinates' in claim ? claim.has_coordinates : 
                   'coordinates' in claim ? !!claim.coordinates : false;
  if (hasCoords) {
    let lat: number | null = null;
    let lon: number | null = null;

    if ('coord_lat' in claim) {
      lat = claim.coord_lat;
      lon = claim.coord_lon;
    } else if ('coordinates' in claim && claim.coordinates) {
      lat = claim.coordinates.lat;
      lon = claim.coordinates.lon;
    }

    if (!isValidWGS84(lat, lon)) {
      failures.push('INVALID_COORDINATES');
    }
  }

  // 8. Region constraint (v0 = Turkey only)
  const region = 'region' in claim ? claim.region : 'Turkey';
  if (region !== 'Turkey') {
    failures.push('REGION_NOT_TURKEY');
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

// =============================================================================
// Hypothesis Auto-Check (DRAFT → REVIEW_READY gate)
// =============================================================================

/**
 * Auto-check for hypotheses before transitioning to REVIEW_READY.
 * 
 * Validates:
 * - Has at least one supporting claim
 * - All supporting claims are APPROVED
 * - Has cross-checks documented (P0-5)
 * - Has failure modes screened (P0-5)
 * - Region = Turkey (v0)
 */
export function autoCheckHypothesis(
  hypothesis: Hypothesis | CreateHypothesisInput,
  supportingClaims: Array<{ status: string }> | null
): AutoCheckResult {
  const failures: AutoCheckFailure[] = [];

  // 1. Must have supporting claims
  if (!supportingClaims?.length) {
    failures.push('NO_SUPPORTING_CLAIMS');
  }

  // 2. All supporting claims must be APPROVED
  if (supportingClaims) {
    const nonApproved = supportingClaims.filter((c) => c.status !== 'APPROVED');
    if (nonApproved.length > 0) {
      failures.push('SUPPORTING_CLAIMS_NOT_APPROVED');
    }
  }

  // 3. Cross-checks required (P0-5: single-layer false positive mitigation)
  let crossChecks: string[] = [];
  if ('cross_checks' in hypothesis) {
    if (typeof hypothesis.cross_checks === 'string') {
      try {
        crossChecks = JSON.parse(hypothesis.cross_checks);
      } catch {
        crossChecks = [];
      }
    } else if (Array.isArray(hypothesis.cross_checks)) {
      crossChecks = hypothesis.cross_checks;
    }
  }
  if (crossChecks.length === 0) {
    failures.push('NO_CROSS_CHECKS');
  }

  // 4. Failure modes screened required (P0-5)
  let failureModes: string[] = [];
  if ('failure_modes_screened' in hypothesis) {
    if (typeof hypothesis.failure_modes_screened === 'string') {
      try {
        failureModes = JSON.parse(hypothesis.failure_modes_screened);
      } catch {
        failureModes = [];
      }
    } else if (Array.isArray(hypothesis.failure_modes_screened)) {
      failureModes = hypothesis.failure_modes_screened;
    }
  }
  if (failureModes.length === 0) {
    failures.push('NO_FAILURE_MODES_SCREENED');
  }

  // 5. Region constraint (v0 = Turkey only)
  const region = 'region' in hypothesis ? hypothesis.region : 'Turkey';
  if (region !== 'Turkey') {
    failures.push('REGION_NOT_TURKEY');
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

// =============================================================================
// Coordinate Validation
// =============================================================================

/**
 * Validates WGS84 coordinates.
 * Turkey bounding box (approximate): 25.5°E to 44.8°E, 35.8°N to 42.1°N
 */
export function isValidWGS84(lat: number | null, lon: number | null): boolean {
  if (lat === null || lon === null) return false;
  if (typeof lat !== 'number' || typeof lon !== 'number') return false;
  if (isNaN(lat) || isNaN(lon)) return false;

  // Global WGS84 bounds
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;

  return true;
}

/**
 * Validates coordinates are within Turkey's approximate bounding box.
 * Used for v0 region constraint enforcement.
 */
export function isWithinTurkey(lat: number, lon: number): boolean {
  // Turkey bounding box (with buffer)
  const TURKEY_MIN_LAT = 35.5;
  const TURKEY_MAX_LAT = 42.5;
  const TURKEY_MIN_LON = 25.0;
  const TURKEY_MAX_LON = 45.0;

  return (
    lat >= TURKEY_MIN_LAT &&
    lat <= TURKEY_MAX_LAT &&
    lon >= TURKEY_MIN_LON &&
    lon <= TURKEY_MAX_LON
  );
}

// =============================================================================
// Workflow State Machine
// =============================================================================

export type StateTransition = {
  from: string;
  to: string;
  allowed: boolean;
  requiresReviewer: boolean;
};

const ALLOWED_TRANSITIONS: StateTransition[] = [
  // DRAFT can go to REVIEW_READY (via auto-check)
  { from: 'DRAFT', to: 'REVIEW_READY', allowed: true, requiresReviewer: false },
  
  // REVIEW_READY can be reviewed (requires Dr. Amin)
  { from: 'REVIEW_READY', to: 'APPROVED', allowed: true, requiresReviewer: true },
  { from: 'REVIEW_READY', to: 'REJECTED', allowed: true, requiresReviewer: true },
  { from: 'REVIEW_READY', to: 'INSUFFICIENT_EVIDENCE', allowed: true, requiresReviewer: true },
  
  // Rejected/Insufficient can be revised back to DRAFT
  { from: 'REJECTED', to: 'DRAFT', allowed: true, requiresReviewer: false },
  { from: 'INSUFFICIENT_EVIDENCE', to: 'DRAFT', allowed: true, requiresReviewer: false },
];

/**
 * Checks if a state transition is allowed.
 */
export function isTransitionAllowed(from: string, to: string): StateTransition | null {
  return ALLOWED_TRANSITIONS.find((t) => t.from === from && t.to === to) || null;
}

/**
 * Gets all allowed next states from current state.
 */
export function getAllowedNextStates(currentState: string): string[] {
  return ALLOWED_TRANSITIONS
    .filter((t) => t.from === currentState && t.allowed)
    .map((t) => t.to);
}

// =============================================================================
// Input Validation (for API routes)
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates CreateSourceInput.
 */
export function validateSourceInput(input: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!input || typeof input !== 'object') {
    return [{ field: 'body', message: 'Request body must be an object' }];
  }

  const data = input as Record<string, unknown>;

  if (!data.doc_id || typeof data.doc_id !== 'string') {
    errors.push({ field: 'doc_id', message: 'doc_id is required and must be a string' });
  }

  if (!data.r2_key || typeof data.r2_key !== 'string') {
    errors.push({ field: 'r2_key', message: 'r2_key is required and must be a string' });
  }

  if (!data.title || typeof data.title !== 'string') {
    errors.push({ field: 'title', message: 'title is required and must be a string' });
  }

  const validSourceTypes = [
    'OFFICIAL_GEOLOGY_DATASET',
    'OFFICIAL_GEOLOGY_MAP',
    'PEER_REVIEWED',
    'OFFICIAL_SATELLITE_PRODUCT',
    'SATELLITE_METADATA',
    'EXPLORATION_REPORT',
  ];
  if (!data.source_type || !validSourceTypes.includes(data.source_type as string)) {
    errors.push({ 
      field: 'source_type', 
      message: `source_type must be one of: ${validSourceTypes.join(', ')}` 
    });
  }

  return errors;
}

/**
 * Validates CreateClaimInput.
 */
export function validateClaimInput(input: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!input || typeof input !== 'object') {
    return [{ field: 'body', message: 'Request body must be an object' }];
  }

  const data = input as Record<string, unknown>;

  if (!data.claim_text || typeof data.claim_text !== 'string') {
    errors.push({ field: 'claim_text', message: 'claim_text is required' });
  }

  if (!data.source_id || typeof data.source_id !== 'string') {
    errors.push({ field: 'source_id', message: 'source_id is required' });
  }

  if (!data.excerpt || typeof data.excerpt !== 'string') {
    errors.push({ field: 'excerpt', message: 'excerpt is required (Evidence Pack)' });
  }

  if (!data.method || typeof data.method !== 'string') {
    errors.push({ field: 'method', message: 'method is required (Evidence Pack)' });
  }

  const validUncertaintyLevels = ['LOW', 'MEDIUM', 'HIGH'];
  if (!data.uncertainty_level || !validUncertaintyLevels.includes(data.uncertainty_level as string)) {
    errors.push({ field: 'uncertainty_level', message: 'uncertainty_level must be LOW, MEDIUM, or HIGH' });
  }

  if (!Array.isArray(data.uncertainty_reasons) || data.uncertainty_reasons.length === 0) {
    errors.push({ field: 'uncertainty_reasons', message: 'uncertainty_reasons must be a non-empty array' });
  }

  // At least one excerpt location required
  if (!data.excerpt_location_page && !data.excerpt_location_figure && !data.excerpt_location_section) {
    errors.push({ 
      field: 'excerpt_location', 
      message: 'At least one of excerpt_location_page, excerpt_location_figure, or excerpt_location_section is required' 
    });
  }

  return errors;
}

/**
 * Validates CreateHypothesisInput.
 */
export function validateHypothesisInput(input: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!input || typeof input !== 'object') {
    return [{ field: 'body', message: 'Request body must be an object' }];
  }

  const data = input as Record<string, unknown>;

  if (!data.hypothesis_text || typeof data.hypothesis_text !== 'string') {
    errors.push({ field: 'hypothesis_text', message: 'hypothesis_text is required' });
  }

  if (!Array.isArray(data.supporting_claim_ids) || data.supporting_claim_ids.length === 0) {
    errors.push({ field: 'supporting_claim_ids', message: 'At least one supporting_claim_id is required' });
  }

  if (!Array.isArray(data.cross_checks) || data.cross_checks.length === 0) {
    errors.push({ field: 'cross_checks', message: 'cross_checks array is required (P0-5 mitigation)' });
  }

  if (!Array.isArray(data.failure_modes_screened) || data.failure_modes_screened.length === 0) {
    errors.push({ field: 'failure_modes_screened', message: 'failure_modes_screened array is required (P0-5 mitigation)' });
  }

  return errors;
}

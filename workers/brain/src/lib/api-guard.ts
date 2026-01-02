/**
 * Scanminers Brain v0 — API Guardrails
 * 
 * CRITICAL: This module enforces the APPROVED-only serving invariant.
 * All API responses containing claims or hypotheses MUST go through these guards.
 * 
 * NO-SHIP CONDITION: If any endpoint returns non-APPROVED claims/hypotheses, v0 is no-ship.
 * 
 * @module lib/brain/api-guard
 */

import type {
  Claim,
  ClaimAPIResponse,
  Hypothesis,
  HypothesisAPIResponse,
  Source,
  EvidencePack,
  WorkflowStatus,
} from './types';

// =============================================================================
// APPROVED-Only Guard (MANDATORY for all API responses)
// =============================================================================

/**
 * CRITICAL: Filters items to APPROVED-only status.
 * This is the primary defense against serving unverified data.
 * 
 * @throws Error if called with items that have no status field
 */
export function approvedOnlyFilter<T extends { status: WorkflowStatus }>(
  items: T[]
): T[] {
  return items.filter((item) => item.status === 'APPROVED');
}

/**
 * Single-item guard. Returns null if not APPROVED.
 */
export function approvedOnlyGuard<T extends { status: WorkflowStatus }>(
  item: T | null
): T | null {
  if (!item) return null;
  return item.status === 'APPROVED' ? item : null;
}

// =============================================================================
// Evidence Pack Builder (transforms DB rows to API response format)
// =============================================================================

/**
 * Builds the Evidence Pack from a claim and its source.
 * Evidence Pack is REQUIRED on all API responses.
 */
export function buildEvidencePack(claim: Claim, source: Source): EvidencePack {
  const uncertaintyReasons = safeParseJsonArray(claim.uncertainty_reasons);

  return {
    source: {
      doc_id: source.doc_id,
      r2_key: source.r2_key,
      title: source.title,
      author: source.author,
      year: source.year,
      source_type: source.source_type,
    },
    excerpt: claim.excerpt,
    excerpt_location: {
      page: claim.excerpt_location_page,
      figure: claim.excerpt_location_figure,
      section: claim.excerpt_location_section,
    },
    method: claim.method,
    uncertainty: {
      level: claim.uncertainty_level,
      reasons: uncertaintyReasons,
    },
    coordinates: claim.has_coordinates
      ? {
          type: claim.coord_type!,
          lat: claim.coord_lat!,
          lon: claim.coord_lon!,
          bbox: claim.coord_type === 'BBOX'
            ? {
                min_lat: claim.coord_bbox_min_lat!,
                min_lon: claim.coord_bbox_min_lon!,
                max_lat: claim.coord_bbox_max_lat!,
                max_lon: claim.coord_bbox_max_lon!,
              }
            : null,
        }
      : null,
  };
}

/**
 * Transforms a DB claim row + source to API response format.
 * ONLY call this on APPROVED claims.
 */
export function toClaimAPIResponse(
  claim: Claim,
  source: Source
): ClaimAPIResponse {
  // Defense in depth: verify APPROVED status
  if (claim.status !== 'APPROVED') {
    throw new Error(
      `SECURITY: Attempted to serialize non-APPROVED claim ${claim.id} (status: ${claim.status})`
    );
  }

  return {
    id: claim.id,
    claim_text: claim.claim_text,
    claim_type: claim.claim_type,
    region: claim.region,
    status: 'APPROVED',
    evidence_pack: buildEvidencePack(claim, source),
    reviewed_at: claim.reviewed_at!,
    reviewed_by: claim.reviewed_by!,
  };
}

/**
 * Transforms a DB hypothesis row to API response format.
 * ONLY call this on APPROVED hypotheses with APPROVED supporting claims.
 */
export function toHypothesisAPIResponse(
  hypothesis: Hypothesis,
  supportingClaims: Array<{ claim: Claim; source: Source }>,
  crossCheckClaims: Array<{ claim: Claim; source: Source }>
): HypothesisAPIResponse {
  // Defense in depth: verify APPROVED status
  if (hypothesis.status !== 'APPROVED') {
    throw new Error(
      `SECURITY: Attempted to serialize non-APPROVED hypothesis ${hypothesis.id} (status: ${hypothesis.status})`
    );
  }

  // Verify all supporting claims are APPROVED
  for (const { claim } of supportingClaims) {
    if (claim.status !== 'APPROVED') {
      throw new Error(
        `SECURITY: Hypothesis ${hypothesis.id} has non-APPROVED supporting claim ${claim.id}`
      );
    }
  }

  const uncertaintyReasons = safeParseJsonArray(hypothesis.uncertainty_reasons);
  const crossChecks = safeParseJsonArray(hypothesis.cross_checks);
  const failureModesScreened = safeParseJsonArray(hypothesis.failure_modes_screened);

  return {
    id: hypothesis.id,
    hypothesis_text: hypothesis.hypothesis_text,
    hypothesis_type: hypothesis.hypothesis_type,
    region: hypothesis.region,
    status: 'APPROVED',
    uncertainty: {
      level: hypothesis.uncertainty_level,
      reasons: uncertaintyReasons,
    },
    coordinates: hypothesis.has_coordinates
      ? {
          type: hypothesis.coord_type!,
          lat: hypothesis.coord_lat!,
          lon: hypothesis.coord_lon!,
          bbox: hypothesis.coord_type === 'BBOX'
            ? {
                min_lat: hypothesis.coord_bbox_min_lat!,
                min_lon: hypothesis.coord_bbox_min_lon!,
                max_lat: hypothesis.coord_bbox_max_lat!,
                max_lon: hypothesis.coord_bbox_max_lon!,
              }
            : null,
        }
      : null,
    cross_checks: crossChecks,
    failure_modes_screened: failureModesScreened,
    supporting_claims: supportingClaims.map(({ claim, source }) =>
      toClaimAPIResponse(claim, source)
    ),
    cross_check_claims: crossCheckClaims.map(({ claim, source }) =>
      toClaimAPIResponse(claim, source)
    ),
    reviewed_at: hypothesis.reviewed_at!,
    reviewed_by: hypothesis.reviewed_by!,
  };
}

// =============================================================================
// API Response Wrappers
// =============================================================================

export interface BrainAPIResponse<T> {
  success: boolean;
  data: T;
  meta: {
    total_approved: number;
    includes_evidence_pack: boolean;
    region: 'Turkey';
    timestamp: string;
  };
}

export interface BrainAPIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Wraps successful API response with metadata.
 */
export function wrapSuccess<T>(data: T, totalApproved: number): BrainAPIResponse<T> {
  return {
    success: true,
    data,
    meta: {
      total_approved: totalApproved,
      includes_evidence_pack: true,
      region: 'Turkey',
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Creates error response.
 */
export function wrapError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): BrainAPIError {
  return {
    success: false,
    error: { code, message, details },
  };
}

// =============================================================================
// Reviewer Authorization
// =============================================================================

/**
 * Reviewer identity supports two authorization methods:
 * 
 * 1. STABLE userId (preferred): `provider:userId` format
 *    - `credentials:admin-{username}` - Admin password login
 *    - `github:{github_user_id}` - GitHub OAuth (numeric ID, not login)
 *    - `google:{google_sub}` - Google OAuth (sub claim)
 * 
 * 2. EMAIL (v0 fallback): email address from auth provider
 *    - Less secure but simpler for initial deployment
 *    - Requires auth provider to verify email
 */
export interface ReviewerIdentity {
  provider: 'credentials' | 'github' | 'google';
  userId: string;  // Stable ID from auth provider
  email?: string;  // Email (for fallback, less secure)
}

export interface BrainEnv {
  /**
   * Comma-separated list of allowed reviewer identities (PREFERRED).
   * Format: "provider:userId,provider:userId,..."
   * 
   * Example: "credentials:admin-admin,github:12345678,google:109234567890123456789"
   */
  BRAIN_REVIEWER_IDS?: string;

  /**
   * Email-based reviewer allowlist (v0 FALLBACK).
   * Simpler but less secure than BRAIN_REVIEWER_IDS.
   * 
   * Format: "email1,email2,..."
   * Example: "amin80@gmail.com"
   * 
   * NOTE: Email verification depends on auth provider's email_verified claim.
   * For v0, Dr. Amin's email is used as canonical reviewer.
   */
  BRAIN_REVIEWER_EMAIL?: string;
}

/**
 * Parses the reviewer identity from session token.
 */
export function parseReviewerIdentity(
  token: { provider?: string; sub?: string; id?: string; login?: string; email?: string } | null
): ReviewerIdentity | null {
  if (!token || !token.provider) return null;
  
  const email = token.email || undefined;
  const provider = token.provider as ReviewerIdentity['provider'];
  
  // For credentials, the ID is `admin-{username}` set by authenticateAdminCredentials
  if (provider === 'credentials') {
    const userId = token.sub || token.id;
    if (!userId) return null;
    return { provider, userId, email };
  }
  
  // For GitHub, use the numeric user ID (stable), not login (can change)
  if (provider === 'github') {
    const userId = token.sub || token.id;
    if (!userId) return null;
    return { provider, userId, email };
  }
  
  // For Google, use the `sub` claim (stable Google account ID)
  if (provider === 'google') {
    const userId = token.sub;
    if (!userId) return null;
    return { provider, userId, email };
  }

  return null;
}

/**
 * Formats a ReviewerIdentity to the allowlist string format.
 */
export function formatReviewerIdentity(identity: ReviewerIdentity): string {
  return `${identity.provider}:${identity.userId}`;
}

/**
 * Checks if the actor is authorized to approve/reject claims.
 * 
 * Authorization checks (in order):
 * 1. BRAIN_REVIEWER_IDS - Stable userId allowlist (preferred)
 * 2. BRAIN_REVIEWER_EMAIL - Email allowlist (v0 fallback)
 */
export function isAuthorizedReviewer(
  identity: ReviewerIdentity | null,
  env: BrainEnv
): boolean {
  if (!identity) {
    console.error('[Brain Auth] No reviewer identity provided');
    return false;
  }

  // Method 1: Check against stable userId allowlist (preferred)
  if (env.BRAIN_REVIEWER_IDS) {
    const identityString = formatReviewerIdentity(identity);
    const allowedList = env.BRAIN_REVIEWER_IDS.split(',').map(s => s.trim().toLowerCase());
    const isAllowed = allowedList.includes(identityString.toLowerCase());
    if (isAllowed) {
      console.log(`[Brain Auth] Reviewer ${identityString} authorized via userId allowlist`);
      return true;
    }
    // Fall through to email check if userId not matched
  }

  // Method 2: Check against email allowlist (v0 fallback for Dr. Amin)
  if (env.BRAIN_REVIEWER_EMAIL && identity.email) {
    const allowedEmails = env.BRAIN_REVIEWER_EMAIL.split(',').map(s => s.trim().toLowerCase());
    const isAllowed = allowedEmails.includes(identity.email.toLowerCase());
    if (isAllowed) {
      console.log(`[Brain Auth] Reviewer ${identity.email} authorized via email allowlist`);
      return true;
    }
  }

  // Neither method matched
  if (!env.BRAIN_REVIEWER_IDS && !env.BRAIN_REVIEWER_EMAIL) {
    console.error('[Brain Auth] No reviewer allowlist configured (set BRAIN_REVIEWER_IDS or BRAIN_REVIEWER_EMAIL)');
    return false;
  }

  console.warn(`[Brain Auth] Reviewer ${formatReviewerIdentity(identity)} (email: ${identity.email || 'none'}) not in any allowlist`);
  return false;
}

/**
 * Guard that throws if actor is not authorized reviewer.
 */
export function requireReviewerAuth(
  identity: ReviewerIdentity | null,
  env: BrainEnv
): void {
  if (!isAuthorizedReviewer(identity, env)) {
    throw new UnauthorizedReviewerError(
      identity ? formatReviewerIdentity(identity) : 'unknown'
    );
  }
}

export class UnauthorizedReviewerError extends Error {
  constructor(identityString: string) {
    super(`Identity ${identityString} is not authorized to review claims/hypotheses`);
    this.name = 'UnauthorizedReviewerError';
  }
}

// =============================================================================
// Utilities
// =============================================================================

function safeParseJsonArray(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// =============================================================================
// Middleware Factory for API Routes
// =============================================================================

/**
 * Creates middleware that enforces APPROVED-only serving.
 * Use this in all Brain API routes.
 * 
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const claims = await db.prepare('SELECT * FROM claims').all();
 *   
 *   // MANDATORY: Apply guard before response
 *   return createApprovedOnlyResponse(claims.results, async (approvedClaims) => {
 *     // Transform to API format
 *     const responses = await Promise.all(
 *       approvedClaims.map(async (claim) => {
 *         const source = await getSource(claim.source_id);
 *         return toClaimAPIResponse(claim, source);
 *       })
 *     );
 *     return wrapSuccess(responses, responses.length);
 *   });
 * }
 * ```
 */
export async function createApprovedOnlyResponse<T extends { status: WorkflowStatus }, R>(
  items: T[],
  transformer: (approved: T[]) => Promise<R> | R
): Promise<Response> {
  try {
    const approved = approvedOnlyFilter(items);
    const result = await transformer(approved);
    return Response.json(result);
  } catch (error) {
    console.error('Brain API error:', error);
    
    if (error instanceof UnauthorizedReviewerError) {
      return Response.json(
        wrapError('UNAUTHORIZED_REVIEWER', error.message),
        { status: 403 }
      );
    }
    
    return Response.json(
      wrapError('INTERNAL_ERROR', 'An unexpected error occurred'),
      { status: 500 }
    );
  }
}

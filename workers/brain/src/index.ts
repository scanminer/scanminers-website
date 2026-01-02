/**
 * Scanminers Brain Worker
 * 
 * Geological evidence management service.
 * Enforces APPROVED-only serving and Evidence Pack requirements.
 * 
 * Per DOCTRINE 001: Binary Separation
 * - Separate Worker from main website
 * - API-only integration
 * - Own D1 database (BRAIN_DB) and R2 bucket (BRAIN_DOCS)
 */

import {
  approvedOnlyFilter,
  toClaimAPIResponse,
  toHypothesisAPIResponse,
  wrapSuccess,
  wrapError,
  parseReviewerIdentity,
  requireReviewerAuth,
  type BrainEnv,
} from './lib/api-guard';

import {
  autoCheckClaim,
  autoCheckHypothesis,
  checkSourceAdmissibility,
  validateSourceInput,
  validateClaimInput,
  validateHypothesisInput,
  isTransitionAllowed,
} from './lib/validation';

import type { Source, Claim, Hypothesis, WorkflowStatus } from './lib/types';

export interface Env extends BrainEnv {
  BRAIN_DB: D1Database;
  BRAIN_DOCS: R2Bucket;
  BRAIN_REGION: string;
  BRAIN_VERSION: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers for cross-origin requests from website Worker
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Reviewer-Identity',
    };

    // Handle preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      const response = await routeRequest(path, method, request, env);
      
      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    } catch (error) {
      console.error('[Brain Worker] Unhandled error:', error);
      return Response.json(
        wrapError('INTERNAL_ERROR', 'An unexpected error occurred'),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};

async function routeRequest(
  path: string,
  method: string,
  request: Request,
  env: Env
): Promise<Response> {
  // Health check
  if (path === '/health' && method === 'GET') {
    return Response.json({
      status: 'ok',
      version: env.BRAIN_VERSION,
      region: env.BRAIN_REGION,
      timestamp: new Date().toISOString(),
    });
  }

  // =========================================================================
  // PUBLIC ENDPOINTS (APPROVED-only)
  // =========================================================================

  // GET /claims - List APPROVED claims with Evidence Pack
  if (path === '/claims' && method === 'GET') {
    return handleGetApprovedClaims(env);
  }

  // GET /claims/:id - Get single APPROVED claim with Evidence Pack
  if (path.match(/^\/claims\/[^/]+$/) && method === 'GET') {
    const id = path.split('/')[2];
    return handleGetApprovedClaim(id, env);
  }

  // GET /hypotheses - List APPROVED hypotheses
  if (path === '/hypotheses' && method === 'GET') {
    return handleGetApprovedHypotheses(env);
  }

  // =========================================================================
  // ADMIN ENDPOINTS (require authentication)
  // =========================================================================

  // POST /admin/sources - Upload/register a document
  if (path === '/admin/sources' && method === 'POST') {
    return handleCreateSource(request, env);
  }

  // POST /admin/claims - Create a DRAFT claim
  if (path === '/admin/claims' && method === 'POST') {
    return handleCreateClaim(request, env);
  }

  // POST /admin/claims/:id/submit - Submit for review (DRAFT → REVIEW_READY)
  if (path.match(/^\/admin\/claims\/[^/]+\/submit$/) && method === 'POST') {
    const id = path.split('/')[3];
    return handleSubmitClaim(id, request, env);
  }

  // POST /admin/claims/:id/review - Approve/reject (requires reviewer auth)
  if (path.match(/^\/admin\/claims\/[^/]+\/review$/) && method === 'POST') {
    const id = path.split('/')[3];
    return handleReviewClaim(id, request, env);
  }

  // POST /admin/hypotheses - Create a DRAFT hypothesis
  if (path === '/admin/hypotheses' && method === 'POST') {
    return handleCreateHypothesis(request, env);
  }

  // POST /admin/hypotheses/:id/submit - Submit for review
  if (path.match(/^\/admin\/hypotheses\/[^/]+\/submit$/) && method === 'POST') {
    const id = path.split('/')[3];
    return handleSubmitHypothesis(id, request, env);
  }

  // POST /admin/hypotheses/:id/review - Approve/reject
  if (path.match(/^\/admin\/hypotheses\/[^/]+\/review$/) && method === 'POST') {
    const id = path.split('/')[3];
    return handleReviewHypothesis(id, request, env);
  }

  // GET /admin/pending - List items pending review (for reviewer queue)
  if (path === '/admin/pending' && method === 'GET') {
    return handleGetPendingReview(env);
  }

  // 404
  return Response.json(
    wrapError('NOT_FOUND', `Route ${method} ${path} not found`),
    { status: 404 }
  );
}

// =============================================================================
// PUBLIC HANDLERS (APPROVED-only)
// =============================================================================

async function handleGetApprovedClaims(env: Env): Promise<Response> {
  // Query ONLY from the approved view
  const result = await env.BRAIN_DB.prepare(`
    SELECT * FROM v_approved_claims
    ORDER BY reviewed_at DESC
    LIMIT 100
  `).all();

  // Double-check: filter again (defense in depth)
  const approved = (result.results || []).filter(
    (c: any) => c.status === 'APPROVED'
  );

  return Response.json(wrapSuccess(approved, approved.length));
}

async function handleGetApprovedClaim(id: string, env: Env): Promise<Response> {
  const result = await env.BRAIN_DB.prepare(`
    SELECT * FROM v_approved_claims WHERE id = ?
  `).bind(id).first();

  if (!result || result.status !== 'APPROVED') {
    return Response.json(
      wrapError('NOT_FOUND', 'Claim not found or not approved'),
      { status: 404 }
    );
  }

  return Response.json(wrapSuccess(result, 1));
}

async function handleGetApprovedHypotheses(env: Env): Promise<Response> {
  const result = await env.BRAIN_DB.prepare(`
    SELECT * FROM v_approved_hypotheses
    ORDER BY reviewed_at DESC
    LIMIT 100
  `).all();

  const approved = (result.results || []).filter(
    (h: any) => h.status === 'APPROVED'
  );

  return Response.json(wrapSuccess(approved, approved.length));
}

// =============================================================================
// ADMIN HANDLERS
// =============================================================================

async function handleCreateSource(request: Request, env: Env): Promise<Response> {
  const body = await request.json();
  
  // Validate input
  const errors = validateSourceInput(body);
  if (errors.length > 0) {
    return Response.json(
      wrapError('VALIDATION_ERROR', 'Invalid source input', { errors }),
      { status: 400 }
    );
  }

  // Check admissibility
  const admissibility = checkSourceAdmissibility(body as any);
  
  // Insert source
  const id = crypto.randomUUID();
  await env.BRAIN_DB.prepare(`
    INSERT INTO sources (id, doc_id, r2_key, title, author, year, source_type, 
                         provenance_statement, uncertainty_statement, ingested_by,
                         is_admissible, admissibility_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.doc_id,
    body.r2_key,
    body.title,
    body.author || null,
    body.year || null,
    body.source_type,
    body.provenance_statement || null,
    body.uncertainty_statement || null,
    body.ingested_by || 'system',
    admissibility.admissible ? 1 : 0,
    admissibility.reason
  ).run();

  return Response.json(wrapSuccess({ id, admissible: admissibility.admissible }, 0), { status: 201 });
}

async function handleCreateClaim(request: Request, env: Env): Promise<Response> {
  const body = await request.json();
  
  // Validate input
  const errors = validateClaimInput(body);
  if (errors.length > 0) {
    return Response.json(
      wrapError('VALIDATION_ERROR', 'Invalid claim input', { errors }),
      { status: 400 }
    );
  }

  // Verify source exists and is admissible
  const source = await env.BRAIN_DB.prepare(
    'SELECT * FROM sources WHERE id = ?'
  ).bind(body.source_id).first() as Source | null;

  if (!source) {
    return Response.json(
      wrapError('SOURCE_NOT_FOUND', 'Source document not found'),
      { status: 404 }
    );
  }

  if (!source.is_admissible) {
    return Response.json(
      wrapError('SOURCE_NOT_ADMISSIBLE', 'Source document is not admissible'),
      { status: 400 }
    );
  }

  // Insert claim as DRAFT
  const id = crypto.randomUUID();
  const uncertaintyReasons = JSON.stringify(body.uncertainty_reasons);
  
  await env.BRAIN_DB.prepare(`
    INSERT INTO claims (
      id, claim_text, claim_type, region, source_id,
      excerpt, excerpt_location_page, excerpt_location_figure, excerpt_location_section,
      method, uncertainty_level, uncertainty_reasons,
      has_coordinates, coord_type, coord_lat, coord_lon,
      coord_bbox_min_lat, coord_bbox_min_lon, coord_bbox_max_lat, coord_bbox_max_lon,
      status, created_by
    ) VALUES (?, ?, ?, 'Turkey', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)
  `).bind(
    id,
    body.claim_text,
    body.claim_type,
    body.source_id,
    body.excerpt,
    body.excerpt_location_page || null,
    body.excerpt_location_figure || null,
    body.excerpt_location_section || null,
    body.method,
    body.uncertainty_level,
    uncertaintyReasons,
    body.coordinates ? 1 : 0,
    body.coordinates?.type || null,
    body.coordinates?.lat || null,
    body.coordinates?.lon || null,
    body.coordinates?.bbox?.min_lat || null,
    body.coordinates?.bbox?.min_lon || null,
    body.coordinates?.bbox?.max_lat || null,
    body.coordinates?.bbox?.max_lon || null,
    body.created_by || 'system'
  ).run();

  // Log workflow event
  await logWorkflowEvent(env, 'CLAIM', id, null, 'DRAFT', body.created_by || 'system', 'Claim created');

  return Response.json(wrapSuccess({ id, status: 'DRAFT' }, 0), { status: 201 });
}

async function handleSubmitClaim(id: string, request: Request, env: Env): Promise<Response> {
  // Get claim
  const claim = await env.BRAIN_DB.prepare(
    'SELECT * FROM claims WHERE id = ?'
  ).bind(id).first() as Claim | null;

  if (!claim) {
    return Response.json(wrapError('NOT_FOUND', 'Claim not found'), { status: 404 });
  }

  // Verify transition is allowed
  const transition = isTransitionAllowed(claim.status, 'REVIEW_READY');
  if (!transition?.allowed) {
    return Response.json(
      wrapError('INVALID_TRANSITION', `Cannot submit claim with status ${claim.status}`),
      { status: 400 }
    );
  }

  // Get source for auto-check
  const source = await env.BRAIN_DB.prepare(
    'SELECT * FROM sources WHERE id = ?'
  ).bind(claim.source_id).first() as Source | null;

  // Run auto-check
  const autoCheck = autoCheckClaim(claim, source);
  
  if (!autoCheck.passed) {
    return Response.json(
      wrapError('AUTO_CHECK_FAILED', 'Claim does not meet Evidence Pack requirements', {
        failures: autoCheck.failures,
      }),
      { status: 400 }
    );
  }

  // Update status
  await env.BRAIN_DB.prepare(
    'UPDATE claims SET status = ? WHERE id = ?'
  ).bind('REVIEW_READY', id).run();

  // Log event
  const body = await request.json().catch(() => ({}));
  await logWorkflowEvent(env, 'CLAIM', id, claim.status, 'REVIEW_READY', body.actor || 'system', 'Submitted for review');

  return Response.json(wrapSuccess({ id, status: 'REVIEW_READY' }, 0));
}

async function handleReviewClaim(id: string, request: Request, env: Env): Promise<Response> {
  const body = await request.json();
  
  // Parse reviewer identity from header or body
  const identityHeader = request.headers.get('X-Reviewer-Identity');
  const identity = identityHeader 
    ? parseReviewerIdentity(JSON.parse(identityHeader))
    : parseReviewerIdentity(body.reviewer_identity);

  // CRITICAL: Verify reviewer authorization
  try {
    requireReviewerAuth(identity, env);
  } catch (error) {
    return Response.json(
      wrapError('UNAUTHORIZED_REVIEWER', 'Only authorized reviewers can approve/reject claims'),
      { status: 403 }
    );
  }

  // Get claim
  const claim = await env.BRAIN_DB.prepare(
    'SELECT * FROM claims WHERE id = ?'
  ).bind(id).first() as Claim | null;

  if (!claim) {
    return Response.json(wrapError('NOT_FOUND', 'Claim not found'), { status: 404 });
  }

  // Verify in REVIEW_READY status
  if (claim.status !== 'REVIEW_READY') {
    return Response.json(
      wrapError('INVALID_STATUS', `Claim is in ${claim.status} status, expected REVIEW_READY`),
      { status: 400 }
    );
  }

  // Validate decision
  const validDecisions = ['APPROVED', 'REJECTED', 'INSUFFICIENT_EVIDENCE'];
  if (!validDecisions.includes(body.decision)) {
    return Response.json(
      wrapError('INVALID_DECISION', `Decision must be one of: ${validDecisions.join(', ')}`),
      { status: 400 }
    );
  }

  // Update claim
  const reviewedBy = identity ? `${identity.provider}:${identity.userId}` : 'unknown';
  await env.BRAIN_DB.prepare(`
    UPDATE claims 
    SET status = ?, reviewed_at = datetime('now'), reviewed_by = ?, review_notes = ?
    WHERE id = ?
  `).bind(body.decision, reviewedBy, body.notes || null, id).run();

  // Log event
  await logWorkflowEvent(
    env, 'CLAIM', id, 'REVIEW_READY', body.decision, reviewedBy, body.notes || `Reviewed: ${body.decision}`
  );

  return Response.json(wrapSuccess({ id, status: body.decision, reviewed_by: reviewedBy }, 0));
}

async function handleCreateHypothesis(request: Request, env: Env): Promise<Response> {
  const body = await request.json();
  
  // Validate input
  const errors = validateHypothesisInput(body);
  if (errors.length > 0) {
    return Response.json(
      wrapError('VALIDATION_ERROR', 'Invalid hypothesis input', { errors }),
      { status: 400 }
    );
  }

  // Insert hypothesis as DRAFT
  const id = crypto.randomUUID();
  
  await env.BRAIN_DB.prepare(`
    INSERT INTO hypotheses (
      id, hypothesis_text, hypothesis_type, region,
      uncertainty_level, uncertainty_reasons,
      has_coordinates, coord_type, coord_lat, coord_lon,
      coord_bbox_min_lat, coord_bbox_min_lon, coord_bbox_max_lat, coord_bbox_max_lon,
      cross_checks, failure_modes_screened,
      status, created_by
    ) VALUES (?, ?, ?, 'Turkey', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)
  `).bind(
    id,
    body.hypothesis_text,
    body.hypothesis_type,
    body.uncertainty_level,
    JSON.stringify(body.uncertainty_reasons),
    body.coordinates ? 1 : 0,
    body.coordinates?.type || null,
    body.coordinates?.lat || null,
    body.coordinates?.lon || null,
    body.coordinates?.bbox?.min_lat || null,
    body.coordinates?.bbox?.min_lon || null,
    body.coordinates?.bbox?.max_lat || null,
    body.coordinates?.bbox?.max_lon || null,
    JSON.stringify(body.cross_checks),
    JSON.stringify(body.failure_modes_screened),
    body.created_by || 'system'
  ).run();

  // Link supporting claims
  for (const claimId of body.supporting_claim_ids) {
    await env.BRAIN_DB.prepare(`
      INSERT INTO hypothesis_claims (hypothesis_id, claim_id, role)
      VALUES (?, ?, 'SUPPORTING')
    `).bind(id, claimId).run();
  }

  // Link cross-check claims (if any)
  for (const claimId of (body.cross_check_claim_ids || [])) {
    await env.BRAIN_DB.prepare(`
      INSERT INTO hypothesis_claims (hypothesis_id, claim_id, role)
      VALUES (?, ?, 'CROSS_CHECK')
    `).bind(id, claimId).run();
  }

  await logWorkflowEvent(env, 'HYPOTHESIS', id, null, 'DRAFT', body.created_by || 'system', 'Hypothesis created');

  return Response.json(wrapSuccess({ id, status: 'DRAFT' }, 0), { status: 201 });
}

async function handleSubmitHypothesis(id: string, request: Request, env: Env): Promise<Response> {
  // Get hypothesis
  const hypothesis = await env.BRAIN_DB.prepare(
    'SELECT * FROM hypotheses WHERE id = ?'
  ).bind(id).first() as Hypothesis | null;

  if (!hypothesis) {
    return Response.json(wrapError('NOT_FOUND', 'Hypothesis not found'), { status: 404 });
  }

  // Verify transition allowed
  const transition = isTransitionAllowed(hypothesis.status, 'REVIEW_READY');
  if (!transition?.allowed) {
    return Response.json(
      wrapError('INVALID_TRANSITION', `Cannot submit hypothesis with status ${hypothesis.status}`),
      { status: 400 }
    );
  }

  // Get supporting claims
  const supportingClaims = await env.BRAIN_DB.prepare(`
    SELECT c.* FROM claims c
    JOIN hypothesis_claims hc ON hc.claim_id = c.id
    WHERE hc.hypothesis_id = ? AND hc.role = 'SUPPORTING'
  `).bind(id).all();

  // Run auto-check
  const autoCheck = autoCheckHypothesis(hypothesis, supportingClaims.results as any[]);
  
  if (!autoCheck.passed) {
    return Response.json(
      wrapError('AUTO_CHECK_FAILED', 'Hypothesis does not meet requirements', {
        failures: autoCheck.failures,
      }),
      { status: 400 }
    );
  }

  // Update status
  await env.BRAIN_DB.prepare(
    'UPDATE hypotheses SET status = ? WHERE id = ?'
  ).bind('REVIEW_READY', id).run();

  const body = await request.json().catch(() => ({}));
  await logWorkflowEvent(env, 'HYPOTHESIS', id, hypothesis.status, 'REVIEW_READY', body.actor || 'system', 'Submitted for review');

  return Response.json(wrapSuccess({ id, status: 'REVIEW_READY' }, 0));
}

async function handleReviewHypothesis(id: string, request: Request, env: Env): Promise<Response> {
  const body = await request.json();
  
  // Parse and verify reviewer identity
  const identityHeader = request.headers.get('X-Reviewer-Identity');
  const identity = identityHeader 
    ? parseReviewerIdentity(JSON.parse(identityHeader))
    : parseReviewerIdentity(body.reviewer_identity);

  try {
    requireReviewerAuth(identity, env);
  } catch (error) {
    return Response.json(
      wrapError('UNAUTHORIZED_REVIEWER', 'Only authorized reviewers can approve/reject hypotheses'),
      { status: 403 }
    );
  }

  // Get hypothesis
  const hypothesis = await env.BRAIN_DB.prepare(
    'SELECT * FROM hypotheses WHERE id = ?'
  ).bind(id).first() as Hypothesis | null;

  if (!hypothesis) {
    return Response.json(wrapError('NOT_FOUND', 'Hypothesis not found'), { status: 404 });
  }

  if (hypothesis.status !== 'REVIEW_READY') {
    return Response.json(
      wrapError('INVALID_STATUS', `Hypothesis is in ${hypothesis.status} status, expected REVIEW_READY`),
      { status: 400 }
    );
  }

  const validDecisions = ['APPROVED', 'REJECTED', 'INSUFFICIENT_EVIDENCE'];
  if (!validDecisions.includes(body.decision)) {
    return Response.json(
      wrapError('INVALID_DECISION', `Decision must be one of: ${validDecisions.join(', ')}`),
      { status: 400 }
    );
  }

  const reviewedBy = identity ? `${identity.provider}:${identity.userId}` : 'unknown';
  await env.BRAIN_DB.prepare(`
    UPDATE hypotheses 
    SET status = ?, reviewed_at = datetime('now'), reviewed_by = ?, review_notes = ?
    WHERE id = ?
  `).bind(body.decision, reviewedBy, body.notes || null, id).run();

  await logWorkflowEvent(
    env, 'HYPOTHESIS', id, 'REVIEW_READY', body.decision, reviewedBy, body.notes || `Reviewed: ${body.decision}`
  );

  return Response.json(wrapSuccess({ id, status: body.decision, reviewed_by: reviewedBy }, 0));
}

async function handleGetPendingReview(env: Env): Promise<Response> {
  const pendingClaims = await env.BRAIN_DB.prepare(`
    SELECT id, claim_text, claim_type, created_at, created_by, 'CLAIM' as entity_type
    FROM claims WHERE status = 'REVIEW_READY'
    ORDER BY created_at ASC
  `).all();

  const pendingHypotheses = await env.BRAIN_DB.prepare(`
    SELECT id, hypothesis_text, hypothesis_type, created_at, created_by, 'HYPOTHESIS' as entity_type
    FROM hypotheses WHERE status = 'REVIEW_READY'
    ORDER BY created_at ASC
  `).all();

  return Response.json(wrapSuccess({
    claims: pendingClaims.results || [],
    hypotheses: pendingHypotheses.results || [],
    total: (pendingClaims.results?.length || 0) + (pendingHypotheses.results?.length || 0),
  }, 0));
}

// =============================================================================
// HELPERS
// =============================================================================

async function logWorkflowEvent(
  env: Env,
  entityType: string,
  entityId: string,
  fromStatus: string | null,
  toStatus: string,
  actor: string,
  reason: string
): Promise<void> {
  const id = crypto.randomUUID();
  await env.BRAIN_DB.prepare(`
    INSERT INTO workflow_events (id, entity_type, entity_id, from_status, to_status, actor, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, entityType, entityId, fromStatus, toStatus, actor, reason).run();
}

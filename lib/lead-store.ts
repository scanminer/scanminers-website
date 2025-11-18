import { nanoid } from "nanoid";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export type LeadType = "contact" | "prospectivity_brief" | "consultation";
export type LeadStatus = "new" | "viewed" | "replied";
export type LeadContactStatus = "not_contacted" | "contacted";
export type LeadEventAction =
  | "submitted"
  | "viewed"
  | "replied"
  | "drafted"
  | "note";

export type LeadMetadata = {
  commodities?: string[];
  dataSources?: string[];
  sourceCommodity?: string;
  consent?: boolean;
  expectation?: boolean;
  reference?: string;
  region?: string;
  additionalContext?: string;
  notes?: string;
  [key: string]: unknown;
};

export type LeadRecord = {
  id: string;
  type: LeadType;
  source: string;
  status: LeadStatus;
  name: string;
  email: string;
  company?: string | null;
  role?: string | null;
  message?: string | null;
  goal?: string | null;
  region?: string | null;
  regions?: string | null;
  stage?: string | null;
  timing?: string | null;
  additionalContext?: string | null;
  context?: string | null;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string | null;
  repliedAt?: string | null;
  lastReplyDraft?: string | null;
  lastContactedAt?: string | null;
  lastContactedBy?: string | null;
  contactStatus: LeadContactStatus;
  commodities: string[];
  reference?: string | null;
  metadata: LeadMetadata;
  // AI fields
  aiSummary?: string | null;
  aiTags?: string[];
  aiValueTier?: "high" | "medium" | "low" | null;
  aiUrgency?: "high" | "medium" | "low" | null;
  aiFitScore?: number | null;
  aiConfidence?: number | null;
};

export type LeadEvent = {
  id: number | string;
  leadId: string;
  action: LeadEventAction;
  actor: string;
  detail?: string | null;
  createdAt: string;
};

export type LeadCreateInput = {
  type: LeadType;
  source: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  message?: string;
  goal?: string;
  context?: string;
  additionalContext?: string;
  regions?: string;
  region?: string;
  stage?: string;
  timing?: string;
  commodities?: string[];
  reference?: string;
  metadata?: LeadMetadata;
};

export type LeadSummaryCounts = {
  total: number;
  new: number;
  viewed: number;
  replied: number;
};

export type ListLeadOptions = {
  status?: LeadStatus | "all";
  type?: LeadType | "all";
  limit?: number;
};

export type ListLeadsResult = {
  leads: LeadRecord[];
  summary: LeadSummaryCounts;
};

type LeadStoreAdapter = {
  create(input: LeadCreateInput): Promise<LeadRecord>;
  list(options?: ListLeadOptions): Promise<ListLeadsResult>;
  get(id: string): Promise<LeadRecord | null>;
  events(id: string): Promise<LeadEvent[]>;
  markViewed(id: string, actor?: string): Promise<LeadRecord | null>;
  saveDraft(
    id: string,
    draft: string,
    actor?: string
  ): Promise<LeadRecord | null>;
  markReplied(
    id: string,
    detail?: string | null,
    actor?: string
  ): Promise<LeadRecord | null>;
  addEvent(
    id: string,
    action: LeadEventAction,
    detail?: string | null,
    actor?: string
  ): Promise<void>;
  markContacted(
    id: string,
    actorEmail?: string | null
  ): Promise<LeadRecord | null>;
  // AI methods
  saveAIInsight(
    id: string,
    insight: {
      summary: string;
      tags: string[];
      valueTier: "high" | "medium" | "low";
      urgency: "high" | "medium" | "low";
      fitScore: number;
      confidence: number;
    }
  ): Promise<LeadRecord | null>;
};

const memoryStoreSymbol = Symbol.for("scanminers.leads.memoryStore");

type MemoryState = {
  leads: Map<string, LeadRecord>;
  events: Map<string, LeadEvent[]>;
};

function getMemoryState(): MemoryState {
  const globalAny = globalThis as typeof globalThis & {
    [memoryStoreSymbol]?: MemoryState;
  };
  if (!globalAny[memoryStoreSymbol]) {
    globalAny[memoryStoreSymbol] = {
      leads: new Map(),
      events: new Map(),
    };
  }
  return globalAny[memoryStoreSymbol]!;
}

class MemoryLeadStore implements LeadStoreAdapter {
  async create(input: LeadCreateInput): Promise<LeadRecord> {
    const state = getMemoryState();
    const now = new Date().toISOString();
    const normalizedMetadata = normalizeMetadata(input.metadata);
    const resolvedRegion =
      input.region ??
      input.regions ??
      (typeof normalizedMetadata.region === "string"
        ? normalizedMetadata.region
        : null);
    const resolvedContext =
      input.additionalContext ??
      input.context ??
      (typeof normalizedMetadata.additionalContext === "string"
        ? normalizedMetadata.additionalContext
        : null);
    const record: LeadRecord = {
      id: nanoid(16),
      type: input.type,
      source: input.source,
      status: "new",
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      role: input.role ?? null,
      message: input.message ?? null,
      goal: input.goal ?? null,
      region: resolvedRegion,
      regions: resolvedRegion,
      stage: input.stage ?? null,
      timing: input.timing ?? null,
      additionalContext: resolvedContext,
      context: resolvedContext,
      createdAt: now,
      updatedAt: now,
      viewedAt: null,
      repliedAt: null,
      lastReplyDraft: null,
      lastContactedAt: null,
      lastContactedBy: null,
      contactStatus: "not_contacted",
      commodities:
        input.commodities ??
        (Array.isArray(normalizedMetadata.commodities)
          ? normalizedMetadata.commodities
          : []),
      reference:
        input.reference ??
        (typeof normalizedMetadata.reference === "string"
          ? normalizedMetadata.reference
          : null),
      metadata: normalizedMetadata,
      // AI fields (default null)
      aiSummary: null,
      aiTags: [],
      aiValueTier: null,
      aiUrgency: null,
      aiFitScore: null,
      aiConfidence: null,
    };
    state.leads.set(record.id, record);
    const events = state.events.get(record.id) ?? [];
    events.push({
      id: events.length + 1,
      leadId: record.id,
      action: "submitted",
      actor: "system",
      detail: null,
      createdAt: now,
    });
    state.events.set(record.id, events);
    return record;
  }

  async list(options?: ListLeadOptions): Promise<ListLeadsResult> {
    const state = getMemoryState();
    const entries = Array.from(state.leads.values());
    const filtered = entries
      .filter((lead) =>
        options?.type && options.type !== "all"
          ? lead.type === options.type
          : true
      )
      .filter((lead) =>
        options?.status && options.status !== "all"
          ? lead.status === options.status
          : true
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const limit = options?.limit ?? 50;
    const leads = filtered.slice(0, limit);
    const summary = buildSummary(entries);
    return { leads, summary };
  }

  async get(id: string): Promise<LeadRecord | null> {
    const state = getMemoryState();
    return state.leads.get(id) ?? null;
  }

  async events(id: string): Promise<LeadEvent[]> {
    const state = getMemoryState();
    return state.events.get(id) ?? [];
  }

  async markViewed(id: string, actor = "admin"): Promise<LeadRecord | null> {
    const state = getMemoryState();
    const lead = state.leads.get(id);
    if (!lead) return null;
    if (lead.status === "replied") return lead;
    const now = new Date().toISOString();
    lead.status = "viewed";
    lead.viewedAt = lead.viewedAt ?? now;
    lead.updatedAt = now;
    const timeline = state.events.get(id) ?? [];
    timeline.push({
      id: timeline.length + 1,
      leadId: id,
      action: "viewed",
      actor,
      detail: null,
      createdAt: now,
    });
    state.events.set(id, timeline);
    return lead;
  }

  async saveDraft(
    id: string,
    draft: string,
    actor = "admin"
  ): Promise<LeadRecord | null> {
    const state = getMemoryState();
    const lead = state.leads.get(id);
    if (!lead) return null;
    const now = new Date().toISOString();
    lead.lastReplyDraft = draft;
    lead.updatedAt = now;
    const timeline = state.events.get(id) ?? [];
    timeline.push({
      id: timeline.length + 1,
      leadId: id,
      action: "drafted",
      actor,
      detail: draft.slice(0, 1800),
      createdAt: now,
    });
    state.events.set(id, timeline);
    return lead;
  }

  async markReplied(
    id: string,
    detail: string | null,
    actor = "admin"
  ): Promise<LeadRecord | null> {
    const state = getMemoryState();
    const lead = state.leads.get(id);
    if (!lead) return null;
    const now = new Date().toISOString();
    lead.status = "replied";
    lead.repliedAt = now;
    lead.updatedAt = now;
    if (detail) {
      lead.lastReplyDraft = detail;
    }
    const timeline = state.events.get(id) ?? [];
    timeline.push({
      id: timeline.length + 1,
      leadId: id,
      action: "replied",
      actor,
      detail,
      createdAt: now,
    });
    state.events.set(id, timeline);
    return lead;
  }

  async addEvent(
    id: string,
    action: LeadEventAction,
    detail?: string | null,
    actor = "system"
  ): Promise<void> {
    const state = getMemoryState();
    if (!state.leads.has(id)) return;
    const timeline = state.events.get(id) ?? [];
    const now = new Date().toISOString();
    timeline.push({
      id: timeline.length + 1,
      leadId: id,
      action,
      actor,
      detail: detail ?? null,
      createdAt: now,
    });
    state.events.set(id, timeline);
  }

  async markContacted(
    id: string,
    actorEmail?: string | null
  ): Promise<LeadRecord | null> {
    const state = getMemoryState();
    const lead = state.leads.get(id);
    if (!lead) return null;
    const now = new Date().toISOString();
    lead.lastContactedAt = now;
    lead.lastContactedBy = actorEmail ?? null;
    lead.contactStatus = "contacted";
    lead.updatedAt = now;
    state.leads.set(id, lead);
    return lead;
  }

  async saveAIInsight(
    id: string,
    insight: {
      summary: string;
      tags: string[];
      valueTier: "high" | "medium" | "low";
      urgency: "high" | "medium" | "low";
      fitScore: number;
      confidence: number;
    }
  ): Promise<LeadRecord | null> {
    const state = getMemoryState();
    const lead = state.leads.get(id);
    if (!lead) return null;
    const now = new Date().toISOString();
    lead.aiSummary = insight.summary;
    lead.aiTags = insight.tags;
    lead.aiValueTier = insight.valueTier;
    lead.aiUrgency = insight.urgency;
    lead.aiFitScore = insight.fitScore;
    lead.aiConfidence = insight.confidence;
    lead.updatedAt = now;
    state.leads.set(id, lead);
    return lead;
  }
}

class D1LeadStore implements LeadStoreAdapter {
  constructor(private readonly db: D1Database) {}

  async create(input: LeadCreateInput): Promise<LeadRecord> {
    const now = new Date().toISOString();
    const id = nanoid(16);
    const metadataObject = normalizeMetadata(input.metadata);
    const metadata = JSON.stringify(metadataObject);
    const region =
      input.region ?? input.regions ?? metadataObject.region ?? null;
    const additionalContext =
      input.additionalContext ??
      input.context ??
      metadataObject.additionalContext ??
      null;
    const commodities = JSON.stringify(
      input.commodities ?? metadataObject.commodities ?? []
    );
    const reference =
      input.reference ??
      (typeof metadataObject.reference === "string"
        ? metadataObject.reference
        : null);
    await this.db
      .prepare(
        `INSERT INTO leads (id, type, source, name, email, company, role, message, goal, additional_context, region, stage, timing, status, created_at, updated_at, metadata, commodities, reference, last_contacted_at, last_contacted_by, contact_status, ai_summary, ai_tags, ai_value_tier, ai_urgency, ai_fit_score, ai_confidence)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        input.type,
        input.source,
        input.name,
        input.email,
        input.company ?? null,
        input.role ?? null,
        input.message ?? null,
        input.goal ?? null,
        additionalContext,
        region,
        input.stage ?? null,
        input.timing ?? null,
        now,
        now,
        metadata,
        commodities,
        reference,
        null,
        null,
        "not_contacted",
        null, // ai_summary
        null, // ai_tags
        null, // ai_value_tier
        null, // ai_urgency
        null, // ai_fit_score
        null // ai_confidence
      )
      .run();

    await this.addEvent(id, "submitted", null, "system");
    const lead = await this.get(id);
    if (!lead) throw new Error("Failed to create lead");
    return lead;
  }

  async list(options?: ListLeadOptions): Promise<ListLeadsResult> {
    const where: string[] = [];
    const binds: Array<string | number> = [];

    if (options?.type && options.type !== "all") {
      where.push("type = ?");
      binds.push(options.type);
    }
    if (options?.status && options.status !== "all") {
      if (options.status === "new") {
        where.push("status = 'new'");
      } else if (options.status === "viewed") {
        where.push("status = 'viewed'");
      } else if (options.status === "replied") {
        where.push("status = 'replied'");
      }
    }

    const limit = Math.min(options?.limit ?? 80, 200);
    const query = [
      "SELECT * FROM leads",
      where.length ? `WHERE ${where.join(" AND ")}` : "",
      "ORDER BY datetime(created_at) DESC",
      "LIMIT ?",
    ]
      .filter(Boolean)
      .join(" ");

    const result = await this.db
      .prepare(query)
      .bind(...binds, limit)
      .all<LeadRow>();
    const leads = (result.results ?? []).map(mapLeadRow);
    const summary = await this.summary();
    return { leads, summary };
  }

  async get(id: string): Promise<LeadRecord | null> {
    const row = await this.db
      .prepare("SELECT * FROM leads WHERE id = ? LIMIT 1")
      .bind(id)
      .first<LeadRow>();
    return row ? mapLeadRow(row) : null;
  }

  async events(id: string): Promise<LeadEvent[]> {
    const rows = await this.db
      .prepare(
        "SELECT id, lead_id, action, actor, detail, created_at FROM lead_events WHERE lead_id = ? ORDER BY datetime(created_at) ASC"
      )
      .bind(id)
      .all<LeadEventRow>();
    return (rows.results ?? []).map((row) => ({
      id: row.id,
      leadId: row.lead_id,
      action: row.action as LeadEventAction,
      actor: row.actor,
      detail: row.detail ?? null,
      createdAt: row.created_at,
    }));
  }

  async markViewed(id: string, actor = "admin"): Promise<LeadRecord | null> {
    const lead = await this.get(id);
    if (!lead) return null;
    if (lead.status === "replied") return lead;
    const now = new Date().toISOString();
    await this.db
      .prepare(
        "UPDATE leads SET status = 'viewed', viewed_at = COALESCE(viewed_at, ?), updated_at = ? WHERE id = ?"
      )
      .bind(now, now, id)
      .run();
    await this.addEvent(id, "viewed", null, actor);
    return this.get(id);
  }

  async saveDraft(
    id: string,
    draft: string,
    actor = "admin"
  ): Promise<LeadRecord | null> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        "UPDATE leads SET last_reply_draft = ?, updated_at = ? WHERE id = ?"
      )
      .bind(draft, now, id)
      .run();
    await this.addEvent(id, "drafted", draft, actor);
    return this.get(id);
  }

  async markReplied(
    id: string,
    detail: string | null,
    actor = "admin"
  ): Promise<LeadRecord | null> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        "UPDATE leads SET status = 'replied', replied_at = ?, updated_at = ?, last_reply_draft = COALESCE(?, last_reply_draft) WHERE id = ?"
      )
      .bind(now, now, detail ?? null, id)
      .run();
    await this.addEvent(id, "replied", detail, actor);
    return this.get(id);
  }

  async addEvent(
    id: string,
    action: LeadEventAction,
    detail?: string | null,
    actor = "system"
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        "INSERT INTO lead_events (lead_id, action, actor, detail, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(id, action, actor, detail ?? null, now)
      .run();
  }

  async markContacted(
    id: string,
    actorEmail?: string | null
  ): Promise<LeadRecord | null> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        "UPDATE leads SET last_contacted_at = ?, last_contacted_by = ?, contact_status = 'contacted', updated_at = ? WHERE id = ?"
      )
      .bind(now, actorEmail ?? null, now, id)
      .run();
    return this.get(id);
  }

  async saveAIInsight(
    id: string,
    insight: {
      summary: string;
      tags: string[];
      valueTier: "high" | "medium" | "low";
      urgency: "high" | "medium" | "low";
      fitScore: number;
      confidence: number;
    }
  ): Promise<LeadRecord | null> {
    const now = new Date().toISOString();
    const tagsJSON = JSON.stringify(insight.tags);
    await this.db
      .prepare(
        "UPDATE leads SET ai_summary = ?, ai_tags = ?, ai_value_tier = ?, ai_urgency = ?, ai_fit_score = ?, ai_confidence = ?, updated_at = ? WHERE id = ?"
      )
      .bind(
        insight.summary,
        tagsJSON,
        insight.valueTier,
        insight.urgency,
        insight.fitScore,
        insight.confidence,
        now,
        id
      )
      .run();
    return this.get(id);
  }

  private async summary(): Promise<LeadSummaryCounts> {
    const row = await this.db
      .prepare(
        `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_count,
          SUM(CASE WHEN status = 'viewed' THEN 1 ELSE 0 END) AS viewed_count,
          SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) AS replied_count
        FROM leads`
      )
      .first<{
        total: number;
        new_count: number | null;
        viewed_count: number | null;
        replied_count: number | null;
      }>();

    return {
      total: row?.total ?? 0,
      new: row?.new_count ?? 0,
      viewed: row?.viewed_count ?? 0,
      replied: row?.replied_count ?? 0,
    };
  }
}

type LeadRow = {
  id: string;
  type: string | null;
  source: string;
  status: LeadStatus;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  message: string | null;
  goal: string | null;
  additional_context: string | null;
  region: string | null;
  stage: string | null;
  timing: string | null;
  created_at: string;
  updated_at: string;
  viewed_at: string | null;
  replied_at: string | null;
  last_reply_draft: string | null;
  metadata: string | null;
  commodities: string | null;
  reference: string | null;
  last_contacted_at: string | null;
  last_contacted_by: string | null;
  contact_status: string | null;
  ai_summary: string | null;
  ai_tags: string | null;
  ai_value_tier: string | null;
  ai_urgency: string | null;
  ai_fit_score: number | null;
  ai_confidence: number | null;
};

type LeadEventRow = {
  id: number;
  lead_id: string;
  action: string;
  actor: string;
  detail: string | null;
  created_at: string;
};

function mapLeadRow(row: LeadRow): LeadRecord {
  const metadata = parseMetadata(row.metadata);
  const status = deriveStatus(row.status, row.viewed_at, row.replied_at);
  const region =
    row.region ??
    (typeof metadata.region === "string" ? metadata.region : null);
  const additionalContext =
    row.additional_context ??
    (typeof metadata.additionalContext === "string"
      ? metadata.additionalContext
      : null);
  const commodities =
    parseStringArray(row.commodities) ??
    (Array.isArray(metadata.commodities) ? metadata.commodities : []);
  const reference =
    row.reference ??
    (typeof metadata.reference === "string" ? metadata.reference : null);
  return {
    id: row.id,
    type: normalizeLeadType(row.type),
    source: row.source,
    status,
    name: row.name,
    email: row.email,
    company: row.company,
    role: row.role,
    message: row.message,
    goal: row.goal,
    region,
    regions: region,
    stage: row.stage,
    timing: row.timing,
    additionalContext,
    context: additionalContext,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    viewedAt: row.viewed_at,
    repliedAt: row.replied_at,
    lastReplyDraft: row.last_reply_draft,
    lastContactedAt: row.last_contacted_at,
    lastContactedBy: row.last_contacted_by,
    contactStatus: normalizeContactStatus(row.contact_status),
    commodities,
    reference,
    metadata,
    // AI fields
    aiSummary: row.ai_summary ?? null,
    aiTags: parseStringArray(row.ai_tags) ?? [],
    aiValueTier: normalizeAITier(row.ai_value_tier),
    aiUrgency: normalizeAITier(row.ai_urgency),
    aiFitScore: typeof row.ai_fit_score === "number" ? row.ai_fit_score : null,
    aiConfidence:
      typeof row.ai_confidence === "number" ? row.ai_confidence : null,
  };
}

function normalizeLeadType(value?: string | null): LeadType {
  if (
    value === "prospectivity_brief" ||
    value === "consultation" ||
    value === "contact"
  ) {
    return value;
  }
  if (value === "prospectivity-brief") {
    return "prospectivity_brief";
  }
  return "contact";
}

function normalizeContactStatus(status?: string | null): LeadContactStatus {
  if (status === "contacted") {
    return "contacted";
  }
  return "not_contacted";
}

function normalizeAITier(
  value?: string | null
): "high" | "medium" | "low" | null {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return null;
}

function deriveStatus(
  status: LeadStatus | null,
  viewedAt?: string | null,
  repliedAt?: string | null
): LeadStatus {
  if (status === "replied" || repliedAt) return "replied";
  if (status === "viewed" || viewedAt) return "viewed";
  return "new";
}

function parseMetadata(meta: string | null): LeadMetadata {
  if (!meta) return {};
  try {
    const parsed = JSON.parse(meta);
    return (typeof parsed === "object" && parsed ? parsed : {}) as LeadMetadata;
  } catch {
    return {};
  }
}

function normalizeMetadata(meta?: LeadMetadata): LeadMetadata {
  if (!meta) return {};
  const entries = Object.entries(meta).filter(
    ([, value]) => value !== undefined && value !== null
  );
  return Object.fromEntries(entries);
}

function parseStringArray(value: string | null): string[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => String(entry));
    }
    return null;
  } catch {
    return null;
  }
}

function buildSummary(leads: LeadRecord[]): LeadSummaryCounts {
  return leads.reduce<LeadSummaryCounts>(
    (acc, lead) => {
      acc.total += 1;
      if (lead.status === "new") acc.new += 1;
      else if (lead.status === "viewed") acc.viewed += 1;
      else if (lead.status === "replied") acc.replied += 1;
      return acc;
    },
    { total: 0, new: 0, viewed: 0, replied: 0 }
  );
}

function resolveStore(): LeadStoreAdapter {
  const db = getD1Binding();
  if (db) {
    return new D1LeadStore(db);
  }
  return new MemoryLeadStore();
}

function getD1Binding(): D1Database | null {
  try {
    const context = getCloudflareContext();
    const env = context?.env as { LEADS_DB?: D1Database } | undefined;
    if (env?.LEADS_DB) return env.LEADS_DB;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[leads] Cloudflare context unavailable", error);
    }
  }
  return null;
}

export async function createLead(input: LeadCreateInput): Promise<LeadRecord> {
  return resolveStore().create(input);
}

export async function listLeads(
  options?: ListLeadOptions
): Promise<ListLeadsResult> {
  return resolveStore().list(options);
}

export async function getLead(id: string): Promise<LeadRecord | null> {
  return resolveStore().get(id);
}

export async function getLeadWithEvents(
  id: string
): Promise<{ lead: LeadRecord; events: LeadEvent[] } | null> {
  const store = resolveStore();
  const lead = await store.get(id);
  if (!lead) return null;
  const events = await store.events(id);
  return { lead, events };
}

export async function markLeadViewed(
  id: string,
  actor?: string
): Promise<LeadRecord | null> {
  return resolveStore().markViewed(id, actor);
}

export async function saveLeadDraft(
  id: string,
  draft: string,
  actor?: string
): Promise<LeadRecord | null> {
  return resolveStore().saveDraft(id, draft, actor);
}

export async function markLeadReplied(
  id: string,
  detail?: string | null,
  actor?: string
): Promise<LeadRecord | null> {
  return resolveStore().markReplied(id, detail, actor);
}

export async function addLeadEvent(
  id: string,
  action: LeadEventAction,
  detail?: string | null,
  actor?: string
): Promise<void> {
  return resolveStore().addEvent(id, action, detail, actor);
}

export async function markLeadContacted(
  id: string,
  actorEmail?: string | null
): Promise<LeadRecord | null> {
  return resolveStore().markContacted(id, actorEmail);
}

export async function saveLeadAIInsight(
  id: string,
  insight: {
    summary: string;
    tags: string[];
    valueTier: "high" | "medium" | "low";
    urgency: "high" | "medium" | "low";
    fitScore: number;
    confidence: number;
  }
): Promise<LeadRecord | null> {
  return resolveStore().saveAIInsight(id, insight);
}

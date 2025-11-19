import { nanoid } from "nanoid";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import type { LeadRecord } from "./lead-store";

export type ProjectStatus = "new" | "active" | "completed";

export type ProjectRecord = {
  id: string;
  leadId: string | null;
  clientName: string;
  projectName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  aiProjectSummary?: string | null;
};

export type ProjectTimelineEntry = {
  id: string;
  projectId: string;
  message: string;
  createdAt: string;
};

export type ProjectEmail = {
  id: string;
  projectId: string;
  direction: "inbound" | "outbound";
  subject: string;
  body: string;
  fromEmail?: string | null;
  toEmail?: string | null;
  resendId?: string | null;
  status: "sent" | "delivered" | "failed" | "bounced";
  createdAt: string;
};

export type ListProjectsOptions = {
  status?: ProjectStatus | "all";
  limit?: number;
};

type ProjectStoreAdapter = {
  createFromLead(lead: LeadRecord): Promise<ProjectRecord>;
  list(options?: ListProjectsOptions): Promise<ProjectRecord[]>;
  get(id: string): Promise<ProjectRecord | null>;
  updateStatus(
    id: string,
    status: ProjectStatus
  ): Promise<ProjectRecord | null>;
  addTimelineEntry(id: string, message: string): Promise<ProjectTimelineEntry>;
  listTimelineEntries(id: string): Promise<ProjectTimelineEntry[]>;
  saveAIProjectSummary(
    id: string,
    summary: string
  ): Promise<ProjectRecord | null>;
};

const memoryStoreSymbol = Symbol.for("scanminers.projects.memoryStore");

type MemoryState = {
  projects: Map<string, ProjectRecord>;
  timelines: Map<string, ProjectTimelineEntry[]>;
};

function getMemoryState(): MemoryState {
  const globalAny = globalThis as typeof globalThis & {
    [memoryStoreSymbol]?: MemoryState;
  };
  if (!globalAny[memoryStoreSymbol]) {
    globalAny[memoryStoreSymbol] = {
      projects: new Map(),
      timelines: new Map(),
    };
  }
  return globalAny[memoryStoreSymbol]!;
}

class MemoryProjectStore implements ProjectStoreAdapter {
  async createFromLead(lead: LeadRecord): Promise<ProjectRecord> {
    const state = getMemoryState();
    const existing = lead.id
      ? Array.from(state.projects.values()).find(
          (project) => project.leadId === lead.id
        )
      : null;
    if (existing) return existing;

    const project = buildProjectRecordFromLead(lead);
    state.projects.set(project.id, project);
    state.timelines.set(project.id, []);
    return project;
  }

  async list(options?: ListProjectsOptions): Promise<ProjectRecord[]> {
    const state = getMemoryState();
    const entries = Array.from(state.projects.values());
    const filtered = entries
      .filter((project) =>
        options?.status && options.status !== "all"
          ? project.status === options.status
          : true
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const limit = Math.min(options?.limit ?? 80, 200);
    return filtered.slice(0, limit);
  }

  async get(id: string): Promise<ProjectRecord | null> {
    const state = getMemoryState();
    return state.projects.get(id) ?? null;
  }

  async updateStatus(
    id: string,
    status: ProjectStatus
  ): Promise<ProjectRecord | null> {
    const state = getMemoryState();
    const project = state.projects.get(id);
    if (!project) return null;
    const now = new Date().toISOString();
    project.status = status;
    project.updatedAt = now;
    state.projects.set(id, project);
    await this.addTimelineEntry(id, `Status updated to ${status}`);
    return project;
  }

  async addTimelineEntry(
    id: string,
    message: string
  ): Promise<ProjectTimelineEntry> {
    const state = getMemoryState();
    if (!state.projects.has(id)) {
      throw new Error(`Project ${id} not found`);
    }
    const entry: ProjectTimelineEntry = {
      id: nanoid(16),
      projectId: id,
      message: sanitizeTimelineMessage(message),
      createdAt: new Date().toISOString(),
    };
    const timeline = state.timelines.get(id) ?? [];
    timeline.unshift(entry);
    state.timelines.set(id, timeline);
    return entry;
  }

  async listTimelineEntries(id: string): Promise<ProjectTimelineEntry[]> {
    const state = getMemoryState();
    return [...(state.timelines.get(id) ?? [])];
  }

  async saveAIProjectSummary(
    id: string,
    summary: string
  ): Promise<ProjectRecord | null> {
    const state = getMemoryState();
    const project = state.projects.get(id);
    if (!project) return null;
    const now = new Date().toISOString();
    project.aiProjectSummary = summary;
    project.updatedAt = now;
    state.projects.set(id, project);
    return project;
  }
}

class D1ProjectStore implements ProjectStoreAdapter {
  constructor(private readonly db: D1Database) {}

  async createFromLead(lead: LeadRecord): Promise<ProjectRecord> {
    if (lead.id) {
      const existing = await this.db
        .prepare("SELECT * FROM projects WHERE lead_id = ? LIMIT 1")
        .bind(lead.id)
        .first<ProjectRow>();
      if (existing) return toProjectRecord(existing);
    }

    const project = buildProjectRecordFromLead(lead);
    await this.db
      .prepare(
        `INSERT INTO projects (id, lead_id, client_name, project_name, client_email, client_phone, status, created_at, updated_at, ai_project_summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        project.id,
        lead.id ?? null,
        project.clientName,
        project.projectName,
        project.clientEmail ?? null,
        project.clientPhone ?? null,
        project.status,
        project.createdAt,
        project.updatedAt,
        null
      )
      .run();

    // Link historical lead events to this project
    if (lead.id) {
      await linkLeadEventsToProject(lead.id, project.id);
    }

    return project;
  }

  async list(options?: ListProjectsOptions): Promise<ProjectRecord[]> {
    const where: string[] = [];
    const binds: Array<string | number> = [];

    if (options?.status && options.status !== "all") {
      where.push("status = ?");
      binds.push(options.status);
    }

    const limit = Math.min(options?.limit ?? 120, 200);
    const query = [
      "SELECT * FROM projects",
      where.length ? `WHERE ${where.join(" AND ")}` : "",
      "ORDER BY datetime(created_at) DESC",
      "LIMIT ?",
    ]
      .filter(Boolean)
      .join(" ");

    const result = await this.db
      .prepare(query)
      .bind(...binds, limit)
      .all<ProjectRow>();
    return (result.results ?? []).map(toProjectRecord);
  }

  async get(id: string): Promise<ProjectRecord | null> {
    const row = await this.db
      .prepare("SELECT * FROM projects WHERE id = ? LIMIT 1")
      .bind(id)
      .first<ProjectRow>();
    return row ? toProjectRecord(row) : null;
  }

  async updateStatus(
    id: string,
    status: ProjectStatus
  ): Promise<ProjectRecord | null> {
    const now = new Date().toISOString();
    await this.db
      .prepare("UPDATE projects SET status = ?, updated_at = ? WHERE id = ?")
      .bind(status, now, id)
      .run();
    return this.get(id);
  }

  async addTimelineEntry(
    id: string,
    message: string
  ): Promise<ProjectTimelineEntry> {
    const entryId = nanoid(16);
    const sanitized = sanitizeTimelineMessage(message);
    const now = new Date().toISOString();
    await this.db
      .prepare(
        "INSERT INTO project_timeline (id, project_id, message, created_at) VALUES (?, ?, ?, ?)"
      )
      .bind(entryId, id, sanitized, now)
      .run();
    return { id: entryId, projectId: id, message: sanitized, createdAt: now };
  }

  async listTimelineEntries(id: string): Promise<ProjectTimelineEntry[]> {
    const result = await this.db
      .prepare(
        "SELECT id, project_id, message, created_at FROM project_timeline WHERE project_id = ? ORDER BY datetime(created_at) DESC"
      )
      .bind(id)
      .all<ProjectTimelineRow>();
    return (result.results ?? []).map((row) => ({
      id: row.id,
      projectId: row.project_id,
      message: row.message,
      createdAt: row.created_at,
    }));
  }

  async saveAIProjectSummary(
    id: string,
    summary: string
  ): Promise<ProjectRecord | null> {
    const now = new Date().toISOString();
    await this.db
      .prepare(
        "UPDATE projects SET ai_project_summary = ?, updated_at = ? WHERE id = ?"
      )
      .bind(summary, now, id)
      .run();
    return this.get(id);
  }
}

export function toProjectRecord(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    leadId: row.lead_id ?? null,
    clientName: row.client_name,
    projectName: row.project_name,
    clientEmail: row.client_email ?? null,
    clientPhone: row.client_phone ?? null,
    status: normalizeStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    aiProjectSummary: row.ai_project_summary ?? null,
  };
}

type ProjectRow = {
  id: string;
  lead_id: string | null;
  client_name: string;
  project_name: string;
  client_email?: string | null;
  client_phone?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  ai_project_summary?: string | null;
};

type ProjectTimelineRow = {
  id: string;
  project_id: string;
  message: string;
  created_at: string;
};

function buildProjectRecordFromLead(lead: LeadRecord): ProjectRecord {
  const now = new Date().toISOString();
  return {
    id: nanoid(16),
    leadId: lead.id ?? null,
    clientName: deriveClientName(lead),
    projectName: deriveProjectName(lead),
    clientEmail: lead.email || null,
    clientPhone:
      typeof lead.metadata?.phone === "string" ? lead.metadata.phone : null,
    status: "new",
    createdAt: now,
    updatedAt: now,
    aiProjectSummary: null,
  };
}

function deriveClientName(lead: LeadRecord): string {
  const value = lead.company?.trim() || lead.name.trim();
  return value || "Unknown client";
}

function deriveProjectName(lead: LeadRecord): string {
  const fallback = `${formatLeadType(lead.type)} project`;
  // Prioritize goal and context over message to avoid email content showing as project title
  const candidates = [
    lead.goal,
    typeof lead.metadata?.additionalContext === "string"
      ? lead.metadata.additionalContext
      : undefined,
    typeof lead.metadata?.notes === "string" ? lead.metadata.notes : undefined,
    // Only use company name with prefix if nothing else is available
    lead.company ? `${lead.company} project` : undefined,
  ];
  const primary = candidates
    .find((value) => typeof value === "string" && value.trim().length > 0)
    ?.trim();
  return truncate(primary ?? fallback, 160);
}

function formatLeadType(type: LeadRecord["type"]): string {
  if (type === "prospectivity_brief") return "Prospectivity brief";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function truncate(value: string, max = 120): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function sanitizeTimelineMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("Timeline message cannot be empty");
  }
  return truncate(trimmed, 500);
}

function normalizeStatus(status: string | null | undefined): ProjectStatus {
  if (status === "active" || status === "completed") return status;
  return "new";
}

function resolveStore(): ProjectStoreAdapter {
  const db = getD1Binding();
  if (db) return new D1ProjectStore(db);
  return new MemoryProjectStore();
}

function getD1Binding(): D1Database | null {
  try {
    const context = getCloudflareContext();
    const env = context?.env as { LEADS_DB?: D1Database } | undefined;
    if (env?.LEADS_DB) return env.LEADS_DB;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[projects] Cloudflare context unavailable", error);
    }
  }
  return null;
}

export async function createProjectFromLead(
  lead: LeadRecord
): Promise<ProjectRecord> {
  return resolveStore().createFromLead(lead);
}

export async function listProjects(
  options?: ListProjectsOptions
): Promise<ProjectRecord[]> {
  return resolveStore().list(options);
}

export async function getProjectById(
  id: string
): Promise<ProjectRecord | null> {
  return resolveStore().get(id);
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<ProjectRecord | null> {
  return resolveStore().updateStatus(id, status);
}

export async function addProjectTimelineEntry(
  id: string,
  message: string
): Promise<ProjectTimelineEntry> {
  return resolveStore().addTimelineEntry(id, message);
}

export async function listProjectTimelineEntries(
  id: string
): Promise<ProjectTimelineEntry[]> {
  return resolveStore().listTimelineEntries(id);
}

export async function assertProjectExists(id: string): Promise<ProjectRecord> {
  const project = await getProjectById(id);
  if (!project) {
    throw new Error(`Project ${id} not found`);
  }
  return project;
}

export async function saveProjectAISummary(
  id: string,
  summary: string
): Promise<ProjectRecord | null> {
  return resolveStore().saveAIProjectSummary(id, summary);
}

export async function listProjectEmails(
  projectId: string
): Promise<ProjectEmail[]> {
  const db = getD1Binding();
  if (!db) return [];

  const results = await db
    .prepare(
      `SELECT id, project_id, direction, subject, body, from_email, to_email, resend_id, status, created_at
       FROM project_emails
       WHERE project_id = ?
       ORDER BY created_at DESC`
    )
    .bind(projectId)
    .all();

  type EmailRow = {
    id: string;
    project_id: string;
    direction: string;
    subject: string;
    body: string;
    from_email: string | null;
    to_email: string | null;
    resend_id: string | null;
    status: string;
    created_at: string;
  };

  return ((results.results || []) as EmailRow[]).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    direction: row.direction as "inbound" | "outbound",
    subject: row.subject,
    body: row.body,
    fromEmail: row.from_email,
    toEmail: row.to_email,
    resendId: row.resend_id,
    status: row.status as "sent" | "delivered" | "failed" | "bounced",
    createdAt: row.created_at,
  }));
}

export async function linkLeadEventsToProject(
  leadId: string,
  projectId: string
): Promise<void> {
  const db = getD1Binding();
  if (!db) return;

  await db
    .prepare(
      `UPDATE lead_events
       SET project_id = ?
       WHERE lead_id = ? AND project_id IS NULL`
    )
    .bind(projectId, leadId)
    .run();
}

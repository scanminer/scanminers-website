import { nanoid } from "nanoid";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

// ============================================================================
// Types
// ============================================================================

export type MeetingType = "internal" | "prospect" | "client";
export type ActionStatus = "open" | "in_progress" | "done";

export type MeetingRecord = {
  id: string;
  title: string;
  dateTime: string;
  type: MeetingType;
  participants: string[];
  relatedLeadId: string | null;
  relatedProjectId: string | null;
  notes: string | null;
  decisions: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed fields (from joins)
  openActionsCount?: number;
  leadName?: string | null;
  projectName?: string | null;
};

export type MeetingActionRecord = {
  id: string;
  meetingId: string;
  description: string;
  owner: string;
  status: ActionStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MeetingCreateInput = {
  title: string;
  dateTime: string;
  type?: MeetingType;
  participants?: string[];
  relatedLeadId?: string | null;
  relatedProjectId?: string | null;
  notes?: string;
  decisions?: string;
};

export type MeetingUpdateInput = Partial<MeetingCreateInput>;

export type ActionCreateInput = {
  meetingId: string;
  description: string;
  owner: string;
  status?: ActionStatus;
  dueDate?: string | null;
};

export type ListMeetingsOptions = {
  type?: MeetingType | "all";
  participant?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
};

export type MeetingWithActions = MeetingRecord & {
  actions: MeetingActionRecord[];
};

// Known participants for the team
export const KNOWN_PARTICIPANTS = ["Mahmood", "Dr. Amin", "Mehrtash"] as const;

export type KnownParticipant = (typeof KNOWN_PARTICIPANTS)[number];

// ============================================================================
// Memory Store (for local dev without D1)
// ============================================================================

const memoryStoreSymbol = Symbol.for("scanminers.meetings.memoryStore");

type MemoryState = {
  meetings: Map<string, MeetingRecord>;
  actions: Map<string, MeetingActionRecord>;
};

function getMemoryState(): MemoryState {
  const globalAny = globalThis as typeof globalThis & {
    [memoryStoreSymbol]?: MemoryState;
  };
  if (!globalAny[memoryStoreSymbol]) {
    globalAny[memoryStoreSymbol] = {
      meetings: new Map(),
      actions: new Map(),
    };
  }
  return globalAny[memoryStoreSymbol]!;
}

// ============================================================================
// Store Interface
// ============================================================================

interface MeetingStoreAdapter {
  listMeetings(options?: ListMeetingsOptions): Promise<MeetingRecord[]>;
  getMeeting(id: string): Promise<MeetingRecord | null>;
  getMeetingWithActions(id: string): Promise<MeetingWithActions | null>;
  createMeeting(input: MeetingCreateInput): Promise<MeetingRecord>;
  updateMeeting(
    id: string,
    input: MeetingUpdateInput
  ): Promise<MeetingRecord | null>;
  deleteMeeting(id: string): Promise<boolean>;

  // Action items
  listActions(meetingId: string): Promise<MeetingActionRecord[]>;
  createAction(input: ActionCreateInput): Promise<MeetingActionRecord>;
  updateActionStatus(
    id: string,
    status: ActionStatus
  ): Promise<MeetingActionRecord | null>;
  updateAction(
    id: string,
    updates: Partial<ActionCreateInput>
  ): Promise<MeetingActionRecord | null>;
  deleteAction(id: string): Promise<boolean>;

  // Linking
  linkToLead(meetingId: string, leadId: string): Promise<MeetingRecord | null>;
  linkToProject(
    meetingId: string,
    projectId: string
  ): Promise<MeetingRecord | null>;
  unlinkLead(meetingId: string): Promise<MeetingRecord | null>;
  unlinkProject(meetingId: string): Promise<MeetingRecord | null>;
}

// ============================================================================
// Memory Store Implementation
// ============================================================================

class MemoryMeetingStore implements MeetingStoreAdapter {
  async listMeetings(options?: ListMeetingsOptions): Promise<MeetingRecord[]> {
    const state = getMemoryState();
    let meetings = Array.from(state.meetings.values());

    if (options?.type && options.type !== "all") {
      meetings = meetings.filter((m) => m.type === options.type);
    }
    if (options?.participant) {
      meetings = meetings.filter((m) =>
        m.participants.some((p) =>
          p.toLowerCase().includes(options.participant!.toLowerCase())
        )
      );
    }
    if (options?.dateFrom) {
      meetings = meetings.filter((m) => m.dateTime >= options.dateFrom!);
    }
    if (options?.dateTo) {
      meetings = meetings.filter((m) => m.dateTime <= options.dateTo!);
    }
    if (options?.search) {
      const searchLower = options.search.toLowerCase();
      meetings = meetings.filter(
        (m) =>
          m.title.toLowerCase().includes(searchLower) ||
          m.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date descending
    meetings.sort((a, b) => b.dateTime.localeCompare(a.dateTime));

    // Add open actions count
    for (const meeting of meetings) {
      const actions = Array.from(state.actions.values()).filter(
        (a) => a.meetingId === meeting.id && a.status !== "done"
      );
      meeting.openActionsCount = actions.length;
    }

    if (options?.limit) {
      meetings = meetings.slice(0, options.limit);
    }

    return meetings;
  }

  async getMeeting(id: string): Promise<MeetingRecord | null> {
    const state = getMemoryState();
    return state.meetings.get(id) ?? null;
  }

  async getMeetingWithActions(id: string): Promise<MeetingWithActions | null> {
    const state = getMemoryState();
    const meeting = state.meetings.get(id);
    if (!meeting) return null;

    const actions = Array.from(state.actions.values())
      .filter((a) => a.meetingId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return { ...meeting, actions };
  }

  async createMeeting(input: MeetingCreateInput): Promise<MeetingRecord> {
    const state = getMemoryState();
    const now = new Date().toISOString();
    const meeting: MeetingRecord = {
      id: nanoid(16),
      title: input.title,
      dateTime: input.dateTime,
      type: input.type ?? "internal",
      participants: input.participants ?? [],
      relatedLeadId: input.relatedLeadId ?? null,
      relatedProjectId: input.relatedProjectId ?? null,
      notes: input.notes ?? null,
      decisions: input.decisions ?? null,
      createdAt: now,
      updatedAt: now,
    };
    state.meetings.set(meeting.id, meeting);
    return meeting;
  }

  async updateMeeting(
    id: string,
    input: MeetingUpdateInput
  ): Promise<MeetingRecord | null> {
    const state = getMemoryState();
    const meeting = state.meetings.get(id);
    if (!meeting) return null;

    const updated: MeetingRecord = {
      ...meeting,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.dateTime !== undefined && { dateTime: input.dateTime }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.participants !== undefined && {
        participants: input.participants,
      }),
      ...(input.relatedLeadId !== undefined && {
        relatedLeadId: input.relatedLeadId,
      }),
      ...(input.relatedProjectId !== undefined && {
        relatedProjectId: input.relatedProjectId,
      }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.decisions !== undefined && { decisions: input.decisions }),
      updatedAt: new Date().toISOString(),
    };
    state.meetings.set(id, updated);
    return updated;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    const state = getMemoryState();
    // Delete associated actions first
    for (const [actionId, action] of state.actions) {
      if (action.meetingId === id) {
        state.actions.delete(actionId);
      }
    }
    return state.meetings.delete(id);
  }

  async listActions(meetingId: string): Promise<MeetingActionRecord[]> {
    const state = getMemoryState();
    return Array.from(state.actions.values())
      .filter((a) => a.meetingId === meetingId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async createAction(input: ActionCreateInput): Promise<MeetingActionRecord> {
    const state = getMemoryState();
    const now = new Date().toISOString();
    const action: MeetingActionRecord = {
      id: nanoid(16),
      meetingId: input.meetingId,
      description: input.description,
      owner: input.owner,
      status: input.status ?? "open",
      dueDate: input.dueDate ?? null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    state.actions.set(action.id, action);
    return action;
  }

  async updateActionStatus(
    id: string,
    status: ActionStatus
  ): Promise<MeetingActionRecord | null> {
    const state = getMemoryState();
    const action = state.actions.get(id);
    if (!action) return null;

    const now = new Date().toISOString();
    const updated: MeetingActionRecord = {
      ...action,
      status,
      completedAt: status === "done" ? now : null,
      updatedAt: now,
    };
    state.actions.set(id, updated);
    return updated;
  }

  async updateAction(
    id: string,
    updates: Partial<ActionCreateInput>
  ): Promise<MeetingActionRecord | null> {
    const state = getMemoryState();
    const action = state.actions.get(id);
    if (!action) return null;

    const updated: MeetingActionRecord = {
      ...action,
      ...(updates.description !== undefined && {
        description: updates.description,
      }),
      ...(updates.owner !== undefined && { owner: updates.owner }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.dueDate !== undefined && { dueDate: updates.dueDate }),
      updatedAt: new Date().toISOString(),
    };
    if (updates.status === "done") {
      updated.completedAt = new Date().toISOString();
    }
    state.actions.set(id, updated);
    return updated;
  }

  async deleteAction(id: string): Promise<boolean> {
    const state = getMemoryState();
    return state.actions.delete(id);
  }

  async linkToLead(
    meetingId: string,
    leadId: string
  ): Promise<MeetingRecord | null> {
    return this.updateMeeting(meetingId, { relatedLeadId: leadId });
  }

  async linkToProject(
    meetingId: string,
    projectId: string
  ): Promise<MeetingRecord | null> {
    return this.updateMeeting(meetingId, { relatedProjectId: projectId });
  }

  async unlinkLead(meetingId: string): Promise<MeetingRecord | null> {
    return this.updateMeeting(meetingId, { relatedLeadId: null });
  }

  async unlinkProject(meetingId: string): Promise<MeetingRecord | null> {
    return this.updateMeeting(meetingId, { relatedProjectId: null });
  }
}

// ============================================================================
// D1 Store Implementation
// ============================================================================

class D1MeetingStore implements MeetingStoreAdapter {
  constructor(private db: D1Database) {}

  private rowToMeeting(row: Record<string, unknown>): MeetingRecord {
    let participants: string[] = [];
    if (row.participants) {
      try {
        participants = JSON.parse(row.participants as string);
      } catch {
        participants = [];
      }
    }
    return {
      id: row.id as string,
      title: row.title as string,
      dateTime: row.date_time as string,
      type: row.type as MeetingType,
      participants,
      relatedLeadId: (row.related_lead_id as string) ?? null,
      relatedProjectId: (row.related_project_id as string) ?? null,
      notes: (row.notes as string) ?? null,
      decisions: (row.decisions as string) ?? null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      openActionsCount: row.open_actions_count as number | undefined,
      leadName: (row.lead_name as string) ?? null,
      projectName: (row.project_name as string) ?? null,
    };
  }

  private rowToAction(row: Record<string, unknown>): MeetingActionRecord {
    return {
      id: row.id as string,
      meetingId: row.meeting_id as string,
      description: row.description as string,
      owner: row.owner as string,
      status: row.status as ActionStatus,
      dueDate: (row.due_date as string) ?? null,
      completedAt: (row.completed_at as string) ?? null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  async listMeetings(options?: ListMeetingsOptions): Promise<MeetingRecord[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (options?.type && options.type !== "all") {
      conditions.push("m.type = ?");
      params.push(options.type);
    }
    if (options?.participant) {
      conditions.push("m.participants LIKE ?");
      params.push(`%${options.participant}%`);
    }
    if (options?.dateFrom) {
      conditions.push("m.date_time >= ?");
      params.push(options.dateFrom);
    }
    if (options?.dateTo) {
      conditions.push("m.date_time <= ?");
      params.push(options.dateTo);
    }
    if (options?.search) {
      conditions.push("(m.title LIKE ? OR m.notes LIKE ?)");
      params.push(`%${options.search}%`, `%${options.search}%`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = options?.limit ?? 100;

    const sql = `
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM meeting_actions ma WHERE ma.meeting_id = m.id AND ma.status != 'done') as open_actions_count,
        l.name as lead_name,
        p.project_name as project_name
      FROM meetings m
      LEFT JOIN leads l ON m.related_lead_id = l.id
      LEFT JOIN projects p ON m.related_project_id = p.id
      ${whereClause}
      ORDER BY datetime(m.date_time) DESC
      LIMIT ?
    `;

    const result = await this.db
      .prepare(sql)
      .bind(...params, limit)
      .all();

    return (result.results ?? []).map((row) =>
      this.rowToMeeting(row as Record<string, unknown>)
    );
  }

  async getMeeting(id: string): Promise<MeetingRecord | null> {
    const sql = `
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM meeting_actions ma WHERE ma.meeting_id = m.id AND ma.status != 'done') as open_actions_count,
        l.name as lead_name,
        p.project_name as project_name
      FROM meetings m
      LEFT JOIN leads l ON m.related_lead_id = l.id
      LEFT JOIN projects p ON m.related_project_id = p.id
      WHERE m.id = ?
    `;
    const result = await this.db.prepare(sql).bind(id).first();
    if (!result) return null;
    return this.rowToMeeting(result as Record<string, unknown>);
  }

  async getMeetingWithActions(id: string): Promise<MeetingWithActions | null> {
    const meeting = await this.getMeeting(id);
    if (!meeting) return null;
    const actions = await this.listActions(id);
    return { ...meeting, actions };
  }

  async createMeeting(input: MeetingCreateInput): Promise<MeetingRecord> {
    const id = nanoid(16);
    const now = new Date().toISOString();
    const participants = JSON.stringify(input.participants ?? []);

    const sql = `
      INSERT INTO meetings (id, title, date_time, type, participants, related_lead_id, related_project_id, notes, decisions, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.db
      .prepare(sql)
      .bind(
        id,
        input.title,
        input.dateTime,
        input.type ?? "internal",
        participants,
        input.relatedLeadId ?? null,
        input.relatedProjectId ?? null,
        input.notes ?? null,
        input.decisions ?? null,
        now,
        now
      )
      .run();

    return (await this.getMeeting(id))!;
  }

  async updateMeeting(
    id: string,
    input: MeetingUpdateInput
  ): Promise<MeetingRecord | null> {
    const existing = await this.getMeeting(id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.title !== undefined) {
      updates.push("title = ?");
      params.push(input.title);
    }
    if (input.dateTime !== undefined) {
      updates.push("date_time = ?");
      params.push(input.dateTime);
    }
    if (input.type !== undefined) {
      updates.push("type = ?");
      params.push(input.type);
    }
    if (input.participants !== undefined) {
      updates.push("participants = ?");
      params.push(JSON.stringify(input.participants));
    }
    if (input.relatedLeadId !== undefined) {
      updates.push("related_lead_id = ?");
      params.push(input.relatedLeadId);
    }
    if (input.relatedProjectId !== undefined) {
      updates.push("related_project_id = ?");
      params.push(input.relatedProjectId);
    }
    if (input.notes !== undefined) {
      updates.push("notes = ?");
      params.push(input.notes);
    }
    if (input.decisions !== undefined) {
      updates.push("decisions = ?");
      params.push(input.decisions);
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = ?");
    params.push(new Date().toISOString());
    params.push(id);

    const sql = `UPDATE meetings SET ${updates.join(", ")} WHERE id = ?`;
    await this.db
      .prepare(sql)
      .bind(...params)
      .run();

    return this.getMeeting(id);
  }

  async deleteMeeting(id: string): Promise<boolean> {
    const sql = "DELETE FROM meetings WHERE id = ?";
    const result = await this.db.prepare(sql).bind(id).run();
    return (result.meta?.changes ?? 0) > 0;
  }

  async listActions(meetingId: string): Promise<MeetingActionRecord[]> {
    const sql = `
      SELECT * FROM meeting_actions 
      WHERE meeting_id = ? 
      ORDER BY 
        CASE status 
          WHEN 'open' THEN 1 
          WHEN 'in_progress' THEN 2 
          WHEN 'done' THEN 3 
        END,
        due_date ASC NULLS LAST,
        created_at ASC
    `;
    const result = await this.db.prepare(sql).bind(meetingId).all();
    return (result.results ?? []).map((row) =>
      this.rowToAction(row as Record<string, unknown>)
    );
  }

  async createAction(input: ActionCreateInput): Promise<MeetingActionRecord> {
    const id = nanoid(16);
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO meeting_actions (id, meeting_id, description, owner, status, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.db
      .prepare(sql)
      .bind(
        id,
        input.meetingId,
        input.description,
        input.owner,
        input.status ?? "open",
        input.dueDate ?? null,
        now,
        now
      )
      .run();

    const result = await this.db
      .prepare("SELECT * FROM meeting_actions WHERE id = ?")
      .bind(id)
      .first();
    return this.rowToAction(result as Record<string, unknown>);
  }

  async updateActionStatus(
    id: string,
    status: ActionStatus
  ): Promise<MeetingActionRecord | null> {
    const now = new Date().toISOString();
    const completedAt = status === "done" ? now : null;

    const sql = `
      UPDATE meeting_actions 
      SET status = ?, completed_at = ?, updated_at = ? 
      WHERE id = ?
    `;
    await this.db.prepare(sql).bind(status, completedAt, now, id).run();

    const result = await this.db
      .prepare("SELECT * FROM meeting_actions WHERE id = ?")
      .bind(id)
      .first();
    if (!result) return null;
    return this.rowToAction(result as Record<string, unknown>);
  }

  async updateAction(
    id: string,
    updates: Partial<ActionCreateInput>
  ): Promise<MeetingActionRecord | null> {
    const existing = await this.db
      .prepare("SELECT * FROM meeting_actions WHERE id = ?")
      .bind(id)
      .first();
    if (!existing) return null;

    const cols: string[] = [];
    const params: unknown[] = [];

    if (updates.description !== undefined) {
      cols.push("description = ?");
      params.push(updates.description);
    }
    if (updates.owner !== undefined) {
      cols.push("owner = ?");
      params.push(updates.owner);
    }
    if (updates.status !== undefined) {
      cols.push("status = ?");
      params.push(updates.status);
      if (updates.status === "done") {
        cols.push("completed_at = ?");
        params.push(new Date().toISOString());
      }
    }
    if (updates.dueDate !== undefined) {
      cols.push("due_date = ?");
      params.push(updates.dueDate);
    }

    if (cols.length === 0) {
      return this.rowToAction(existing as Record<string, unknown>);
    }

    cols.push("updated_at = ?");
    params.push(new Date().toISOString());
    params.push(id);

    const sql = `UPDATE meeting_actions SET ${cols.join(", ")} WHERE id = ?`;
    await this.db
      .prepare(sql)
      .bind(...params)
      .run();

    const result = await this.db
      .prepare("SELECT * FROM meeting_actions WHERE id = ?")
      .bind(id)
      .first();
    return this.rowToAction(result as Record<string, unknown>);
  }

  async deleteAction(id: string): Promise<boolean> {
    const sql = "DELETE FROM meeting_actions WHERE id = ?";
    const result = await this.db.prepare(sql).bind(id).run();
    return (result.meta?.changes ?? 0) > 0;
  }

  async linkToLead(
    meetingId: string,
    leadId: string
  ): Promise<MeetingRecord | null> {
    return this.updateMeeting(meetingId, { relatedLeadId: leadId });
  }

  async linkToProject(
    meetingId: string,
    projectId: string
  ): Promise<MeetingRecord | null> {
    return this.updateMeeting(meetingId, { relatedProjectId: projectId });
  }

  async unlinkLead(meetingId: string): Promise<MeetingRecord | null> {
    return this.updateMeeting(meetingId, { relatedLeadId: null });
  }

  async unlinkProject(meetingId: string): Promise<MeetingRecord | null> {
    return this.updateMeeting(meetingId, { relatedProjectId: null });
  }
}

// ============================================================================
// Store Factory
// ============================================================================

let cachedStore: MeetingStoreAdapter | null = null;

async function getMeetingStore(): Promise<MeetingStoreAdapter> {
  if (cachedStore) return cachedStore;

  try {
    const ctx = await getCloudflareContext();
    const env = ctx?.env as { LEADS_DB?: D1Database } | undefined;
    if (env?.LEADS_DB) {
      cachedStore = new D1MeetingStore(env.LEADS_DB);
      return cachedStore;
    }
  } catch {
    // Fall through to memory store
  }

  cachedStore = new MemoryMeetingStore();
  return cachedStore;
}

// ============================================================================
// Public API
// ============================================================================

export async function listMeetings(
  options?: ListMeetingsOptions
): Promise<MeetingRecord[]> {
  const store = await getMeetingStore();
  return store.listMeetings(options);
}

export async function getMeeting(id: string): Promise<MeetingRecord | null> {
  const store = await getMeetingStore();
  return store.getMeeting(id);
}

export async function getMeetingWithActions(
  id: string
): Promise<MeetingWithActions | null> {
  const store = await getMeetingStore();
  return store.getMeetingWithActions(id);
}

export async function createMeeting(
  input: MeetingCreateInput
): Promise<MeetingRecord> {
  const store = await getMeetingStore();
  return store.createMeeting(input);
}

export async function updateMeeting(
  id: string,
  input: MeetingUpdateInput
): Promise<MeetingRecord | null> {
  const store = await getMeetingStore();
  return store.updateMeeting(id, input);
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const store = await getMeetingStore();
  return store.deleteMeeting(id);
}

export async function listMeetingActions(
  meetingId: string
): Promise<MeetingActionRecord[]> {
  const store = await getMeetingStore();
  return store.listActions(meetingId);
}

export async function createMeetingAction(
  input: ActionCreateInput
): Promise<MeetingActionRecord> {
  const store = await getMeetingStore();
  return store.createAction(input);
}

export async function updateMeetingActionStatus(
  id: string,
  status: ActionStatus
): Promise<MeetingActionRecord | null> {
  const store = await getMeetingStore();
  return store.updateActionStatus(id, status);
}

export async function updateMeetingAction(
  id: string,
  updates: Partial<ActionCreateInput>
): Promise<MeetingActionRecord | null> {
  const store = await getMeetingStore();
  return store.updateAction(id, updates);
}

export async function deleteMeetingAction(id: string): Promise<boolean> {
  const store = await getMeetingStore();
  return store.deleteAction(id);
}

export async function linkMeetingToLead(
  meetingId: string,
  leadId: string
): Promise<MeetingRecord | null> {
  const store = await getMeetingStore();
  return store.linkToLead(meetingId, leadId);
}

export async function linkMeetingToProject(
  meetingId: string,
  projectId: string
): Promise<MeetingRecord | null> {
  const store = await getMeetingStore();
  return store.linkToProject(meetingId, projectId);
}

export async function unlinkMeetingLead(
  meetingId: string
): Promise<MeetingRecord | null> {
  const store = await getMeetingStore();
  return store.unlinkLead(meetingId);
}

export async function unlinkMeetingProject(
  meetingId: string
): Promise<MeetingRecord | null> {
  const store = await getMeetingStore();
  return store.unlinkProject(meetingId);
}

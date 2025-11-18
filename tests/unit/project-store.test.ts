import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { LeadRecord } from "@/lib/lead-store";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(() => null),
}));

const memoryStoreSymbol = Symbol.for("scanminers.projects.memoryStore");

function resetMemoryStore() {
  const globalAny = globalThis as typeof globalThis & {
    [memoryStoreSymbol]?: unknown;
  };
  delete globalAny[memoryStoreSymbol];
}

describe("Project Store", () => {
  let createProjectFromLead: typeof import("@/lib/project-store")["createProjectFromLead"];
  let listProjects: typeof import("@/lib/project-store")["listProjects"];
  let getProjectById: typeof import("@/lib/project-store")["getProjectById"];
  let updateProjectStatus: typeof import("@/lib/project-store")["updateProjectStatus"];
  let addProjectTimelineEntry: typeof import("@/lib/project-store")["addProjectTimelineEntry"];
  let listProjectTimelineEntries: typeof import("@/lib/project-store")["listProjectTimelineEntries"];

  beforeEach(async () => {
    resetMemoryStore();
    vi.resetModules();
    const projectStore = await import("@/lib/project-store");
    createProjectFromLead = projectStore.createProjectFromLead;
    listProjects = projectStore.listProjects;
    getProjectById = projectStore.getProjectById;
    updateProjectStatus = projectStore.updateProjectStatus;
    addProjectTimelineEntry = projectStore.addProjectTimelineEntry;
    listProjectTimelineEntries = projectStore.listProjectTimelineEntries;
  });

  afterEach(() => {
    resetMemoryStore();
  });

  it("creates a project from a lead and derives helpful metadata", async () => {
    const lead = buildLead({
      id: "lead-001",
      company: "Scanminers",
      goal: "Deliver mineral map",
    });

    const project = await createProjectFromLead(lead);

    expect(project.clientName).toBe("Scanminers");
    expect(project.projectName).toBe("Deliver mineral map");
    expect(project.status).toBe("new");
    expect(project.leadId).toBe("lead-001");
  });

  it("is idempotent when converting the same lead twice", async () => {
    const lead = buildLead({ id: "lead-dup", goal: "Seismic analysis" });

    const first = await createProjectFromLead(lead);
    const second = await createProjectFromLead(lead);

    expect(second.id).toBe(first.id);
    expect(second.projectName).toBe("Seismic analysis");
  });

  it("lists projects with newest first and filters by status", async () => {
    const leadA = buildLead({ id: "lead-a", goal: "Prospecting" });
    const leadB = buildLead({ id: "lead-b", goal: "Modeling" });
    const leadC = buildLead({ id: "lead-c", goal: "Launch" });

    const projectA = await createProjectFromLead(leadA);
    const projectB = await createProjectFromLead(leadB);
    const projectC = await createProjectFromLead(leadC);

    await updateProjectStatus(projectB.id, "active");
    await updateProjectStatus(projectC.id, "completed");

    const allProjects = await listProjects();
    expect(allProjects.map((p) => p.id)).toEqual(
      expect.arrayContaining([projectA.id, projectB.id, projectC.id])
    );
    const sorted = [...allProjects].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    expect(allProjects.map((p) => p.id)).toEqual(sorted.map((p) => p.id));

    const activeOnly = await listProjects({ status: "active" });
    expect(activeOnly).toHaveLength(1);
    expect(activeOnly[0].id).toBe(projectB.id);
  });

  it("retrieves a project by id", async () => {
    const lead = buildLead({ id: "lead-find" });
    const project = await createProjectFromLead(lead);

    const fetched = await getProjectById(project.id);
    expect(fetched?.projectName).toBe(project.projectName);

    const missing = await getProjectById("unknown");
    expect(missing).toBeNull();
  });

  it("updates project status and refreshes timestamps", async () => {
    const lead = buildLead({ id: "lead-status" });
    const project = await createProjectFromLead(lead);
    const originalUpdatedAt = project.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));
    const updated = await updateProjectStatus(project.id, "active");

    expect(updated?.status).toBe("active");
    expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
  });

  it("adds timeline entries and sorts them newest first", async () => {
    const lead = buildLead({ id: "lead-timeline" });
    const project = await createProjectFromLead(lead);

    await addProjectTimelineEntry(project.id, "Kickoff scheduled");
    await addProjectTimelineEntry(project.id, "Data room shared");

    const timeline = await listProjectTimelineEntries(project.id);

    expect(timeline).toHaveLength(2);
    expect(timeline[0].message).toBe("Data room shared");
    expect(timeline[1].message).toBe("Kickoff scheduled");
  });

  it("rejects empty timeline messages", async () => {
    const lead = buildLead({ id: "lead-empty" });
    const project = await createProjectFromLead(lead);

    await expect(addProjectTimelineEntry(project.id, "   ")).rejects.toThrow(
      "Timeline message cannot be empty"
    );
  });
});

function buildLead(overrides: Partial<LeadRecord> = {}): LeadRecord {
  const now = new Date().toISOString();
  return {
    id: overrides.id ?? `lead-${Math.random().toString(36).slice(2, 8)}`,
    type: overrides.type ?? "contact",
    source: overrides.source ?? "test",
    status: overrides.status ?? "new",
    name: overrides.name ?? "Jane Sample",
    email: overrides.email ?? "jane@example.com",
    company: overrides.company ?? "Sample Org",
    role: overrides.role ?? "CTO",
    message: overrides.message ?? "",
    goal: overrides.goal ?? "",
    region: overrides.region ?? null,
    regions: overrides.regions ?? null,
    stage: overrides.stage ?? null,
    timing: overrides.timing ?? null,
    additionalContext: overrides.additionalContext ?? null,
    context: overrides.context ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    viewedAt: overrides.viewedAt ?? null,
    repliedAt: overrides.repliedAt ?? null,
    lastReplyDraft: overrides.lastReplyDraft ?? null,
    lastContactedAt: overrides.lastContactedAt ?? null,
    lastContactedBy: overrides.lastContactedBy ?? null,
    contactStatus: overrides.contactStatus ?? "not_contacted",
    commodities: overrides.commodities ?? [],
    reference: overrides.reference ?? null,
    metadata: overrides.metadata ?? {},
  };
}

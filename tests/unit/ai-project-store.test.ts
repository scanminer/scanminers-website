import { describe, it, expect, beforeEach, vi } from "vitest";
import type { LeadRecord } from "@/lib/lead-store";
import type { ProjectRecord } from "@/lib/project-store";

// Mock the Cloudflare context
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(() => null),
}));

// Clear the in-memory stores between tests
const memoryStoreSymbol = Symbol.for("scanminers.leads.memoryStore");
const projectMemoryStoreSymbol = Symbol.for("scanminers.projects.memoryStore");

describe("Project AI Store Extensions", () => {
  let createProjectFromLead: (lead: LeadRecord) => Promise<ProjectRecord>;
  let getProjectById: (id: string) => Promise<ProjectRecord | null>;
  let saveProjectAISummary: (
    id: string,
    summary: string
  ) => Promise<ProjectRecord | null>;

  beforeEach(async () => {
    // Clear the global memory stores
    const globalAny = globalThis as typeof globalThis & {
      [memoryStoreSymbol]?: unknown;
      [projectMemoryStoreSymbol]?: unknown;
    };
    delete globalAny[memoryStoreSymbol];
    delete globalAny[projectMemoryStoreSymbol];
    // Reset modules to clear in-memory stores
    vi.resetModules();
    const projectStore = await import("@/lib/project-store");
    createProjectFromLead = projectStore.createProjectFromLead;
    getProjectById = projectStore.getProjectById;
    saveProjectAISummary = projectStore.saveProjectAISummary;
  });

  describe("saveProjectAISummary", () => {
    it("should save AI project summary", async () => {
      const mockLead: LeadRecord = {
        id: "lead-1",
        type: "contact",
        source: "test",
        status: "new",
        name: "Jane Doe",
        email: "jane@example.com",
        company: "Mining Corp",
        role: "Exploration Manager",
        message: "Need lithium targeting",
        goal: null,
        region: "Western Australia",
        regions: null,
        stage: null,
        timing: null,
        additionalContext: null,
        context: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewedAt: null,
        repliedAt: null,
        lastReplyDraft: null,
        lastContactedAt: null,
        lastContactedBy: null,
        contactStatus: "not_contacted",
        commodities: ["lithium"],
        reference: null,
        metadata: {},
      };

      const project = await createProjectFromLead(mockLead);

      const aiSummary =
        "Project initiated from high-value lithium exploration lead. Client is Exploration Manager at Mining Corp seeking targeting services in Western Australia. Priority: high due to specific commodity focus and clear regional scope.";

      const updated = await saveProjectAISummary(project.id, aiSummary);

      expect(updated).toBeDefined();
      expect(updated?.aiProjectSummary).toBe(aiSummary);
    });

    it("should persist AI summary across retrieval", async () => {
      const mockLead: LeadRecord = {
        id: "lead-2",
        type: "prospectivity_brief",
        source: "test",
        status: "new",
        name: "John Smith",
        email: "john@example.com",
        company: "Gold Explorers Inc",
        role: "Senior Geologist",
        message: "Gold prospectivity study needed",
        goal: null,
        region: "Northern Territory",
        regions: null,
        stage: null,
        timing: null,
        additionalContext: null,
        context: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewedAt: null,
        repliedAt: null,
        lastReplyDraft: null,
        lastContactedAt: null,
        lastContactedBy: null,
        contactStatus: "not_contacted",
        commodities: ["gold"],
        reference: null,
        metadata: {},
      };

      const project = await createProjectFromLead(mockLead);

      const aiSummary =
        "Prospectivity brief project for gold targeting in Northern Territory. Client: Senior Geologist at Gold Explorers Inc. Standard scope with regional focus.";

      await saveProjectAISummary(project.id, aiSummary);

      // Retrieve the project again
      const retrieved = await getProjectById(project.id);

      expect(retrieved?.aiProjectSummary).toBe(aiSummary);
    });

    it("should update existing AI summary", async () => {
      const mockLead: LeadRecord = {
        id: "lead-3",
        type: "consultation",
        source: "test",
        status: "new",
        name: "Alice Brown",
        email: "alice@example.com",
        company: "Copper Mining Ltd",
        role: "VP Exploration",
        message: "Consultation on copper targeting methodology",
        goal: null,
        region: "South Australia",
        regions: null,
        stage: null,
        timing: null,
        additionalContext: null,
        context: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewedAt: null,
        repliedAt: null,
        lastReplyDraft: null,
        lastContactedAt: null,
        lastContactedBy: null,
        contactStatus: "not_contacted",
        commodities: ["copper"],
        reference: null,
        metadata: {},
      };

      const project = await createProjectFromLead(mockLead);

      const firstSummary = "Initial consultation project setup";
      await saveProjectAISummary(project.id, firstSummary);

      const updatedSummary =
        "Consultation project advanced to methodology discussion. Client (VP Exploration) confirmed copper targeting focus for South Australian tenements. Next: data room access and preliminary analysis.";
      const updated = await saveProjectAISummary(project.id, updatedSummary);

      expect(updated?.aiProjectSummary).toBe(updatedSummary);
    });

    it("should return null for non-existent project", async () => {
      const result = await saveProjectAISummary(
        "non-existent-id",
        "Test summary"
      );

      expect(result).toBeNull();
    });
  });

  describe("AI field initialization", () => {
    it("should initialize new projects with null AI summary", async () => {
      const mockLead: LeadRecord = {
        id: "lead-init",
        type: "contact",
        source: "test",
        status: "new",
        name: "Test User",
        email: "test@example.com",
        company: "Test Corp",
        role: "Manager",
        message: "Test message",
        goal: null,
        region: null,
        regions: null,
        stage: null,
        timing: null,
        additionalContext: null,
        context: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewedAt: null,
        repliedAt: null,
        lastReplyDraft: null,
        lastContactedAt: null,
        lastContactedBy: null,
        contactStatus: "not_contacted",
        commodities: [],
        reference: null,
        metadata: {},
      };

      const project = await createProjectFromLead(mockLead);

      expect(project.aiProjectSummary).toBeNull();
    });
  });
});

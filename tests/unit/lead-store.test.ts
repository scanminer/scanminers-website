import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type {
  LeadCreateInput,
  LeadRecord,
  LeadStatus,
  LeadType,
} from "@/lib/lead-store";

// Mock the Cloudflare context
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(() => null),
}));

// Clear the in-memory store between tests
const memoryStoreSymbol = Symbol.for("scanminers.leads.memoryStore");

describe("Lead Store", () => {
  let createLead: (input: LeadCreateInput) => Promise<LeadRecord>;
  let listLeads: (options?: {
    status?: LeadStatus | "all";
    type?: LeadType | "all";
    limit?: number;
  }) => Promise<{
    leads: LeadRecord[];
    summary: { total: number; new: number; viewed: number; replied: number };
  }>;
  let getLead: (id: string) => Promise<LeadRecord | null>;
  let markLeadViewed: (
    id: string,
    actor?: string
  ) => Promise<LeadRecord | null>;
  let saveLeadDraft: (
    id: string,
    draft: string,
    actor?: string
  ) => Promise<LeadRecord | null>;
  let markLeadReplied: (
    id: string,
    detail?: string | null,
    actor?: string
  ) => Promise<LeadRecord | null>;
  let markLeadContacted: (
    id: string,
    actorEmail?: string | null
  ) => Promise<LeadRecord | null>;

  beforeEach(async () => {
    // Clear the global memory store
    const globalAny = globalThis as typeof globalThis & {
      [memoryStoreSymbol]?: unknown;
    };
    delete globalAny[memoryStoreSymbol];
    // Reset module to clear in-memory store
    vi.resetModules();
    const leadStore = await import("@/lib/lead-store");
    createLead = leadStore.createLead;
    listLeads = leadStore.listLeads;
    getLead = leadStore.getLead;
    markLeadViewed = leadStore.markLeadViewed;
    saveLeadDraft = leadStore.saveLeadDraft;
    markLeadReplied = leadStore.markLeadReplied;
    markLeadContacted = leadStore.markLeadContacted;
  });

  afterEach(() => {
    // Ensure cleanup after each test
    const globalAny = globalThis as typeof globalThis & {
      [memoryStoreSymbol]?: unknown;
    };
    delete globalAny[memoryStoreSymbol];
  });

  describe("createLead", () => {
    it("should create a contact lead with required fields", async () => {
      const input: LeadCreateInput = {
        type: "contact",
        source: "contact-form",
        name: "John Doe",
        email: "john@example.com",
        company: "Acme Corp",
        message: "Interested in your services",
      };

      const lead = await createLead(input);

      expect(lead.id).toBeDefined();
      expect(lead.type).toBe("contact");
      expect(lead.source).toBe("contact-form");
      expect(lead.name).toBe("John Doe");
      expect(lead.email).toBe("john@example.com");
      expect(lead.company).toBe("Acme Corp");
      expect(lead.message).toBe("Interested in your services");
      expect(lead.status).toBe("new");
      expect(lead.createdAt).toBeDefined();
      expect(lead.updatedAt).toBeDefined();
    });

    it("should create a prospectivity_brief lead with commodities", async () => {
      const input: LeadCreateInput = {
        type: "prospectivity_brief",
        source: "prospectivity-brief-form",
        name: "Jane Smith",
        email: "jane@mining.com",
        company: "Mining Inc",
        role: "Exploration Manager",
        goal: "Find lithium deposits",
        regions: "Western Australia",
        stage: "early-stage",
        commodities: ["lithium", "nickel"],
        metadata: {
          dataSources: ["Landsat", "ASTER"],
          sourceCommodity: "lithium",
        },
      };

      const lead = await createLead(input);

      expect(lead.type).toBe("prospectivity_brief");
      expect(lead.goal).toBe("Find lithium deposits");
      expect(lead.commodities).toEqual(["lithium", "nickel"]);
      expect(lead.metadata?.dataSources).toEqual(["Landsat", "ASTER"]);
      expect(lead.region).toBe("Western Australia");
      expect(lead.stage).toBe("early-stage");
    });

    it("should create a consultation lead with timing", async () => {
      const input: LeadCreateInput = {
        type: "consultation",
        source: "consultation-form",
        name: "Bob Wilson",
        email: "bob@exploration.com",
        company: "Exploration Co",
        role: "CEO",
        regions: "Nevada, USA",
        stage: "exploration",
        timing: "Q2 2025",
        commodities: ["gold", "silver"],
        additionalContext: "Looking for advanced remote sensing analysis",
      };

      const lead = await createLead(input);

      expect(lead.type).toBe("consultation");
      expect(lead.timing).toBe("Q2 2025");
      expect(lead.additionalContext).toBe(
        "Looking for advanced remote sensing analysis"
      );
      expect(lead.context).toBe("Looking for advanced remote sensing analysis");
    });

    it("should normalize metadata and remove undefined values", async () => {
      const input: LeadCreateInput = {
        type: "contact",
        source: "test",
        name: "Test User",
        email: "test@test.com",
        metadata: {
          consent: true,
          notes: "Some notes",
          emptyField: undefined,
        },
      };

      const lead = await createLead(input);

      expect(lead.metadata?.consent).toBe(true);
      expect(lead.metadata?.notes).toBe("Some notes");
      expect("emptyField" in (lead.metadata || {})).toBe(false);
    });
  });

  describe("listLeads", () => {
    beforeEach(async () => {
      // Create test leads
      await createLead({
        type: "contact",
        source: "contact-form",
        name: "Lead 1",
        email: "lead1@test.com",
        message: "Test message 1",
      });

      await createLead({
        type: "prospectivity_brief",
        source: "brief-form",
        name: "Lead 2",
        email: "lead2@test.com",
        goal: "Test goal",
      });

      await createLead({
        type: "consultation",
        source: "consultation-form",
        name: "Lead 3",
        email: "lead3@test.com",
        regions: "Australia",
        commodities: ["copper"],
      });
    });

    it("should list all leads", async () => {
      const result = await listLeads();

      expect(result.leads).toHaveLength(3);
      expect(result.summary.total).toBe(3);
      expect(result.summary.new).toBe(3);
      expect(result.summary.viewed).toBe(0);
      expect(result.summary.replied).toBe(0);
    });

    it("should filter leads by type", async () => {
      const result = await listLeads({ type: "contact" });

      expect(result.leads).toHaveLength(1);
      expect(result.leads[0]?.type).toBe("contact");
      expect(result.summary.total).toBe(3); // Summary is total across all types
    });

    it("should filter leads by status", async () => {
      // Mark one lead as viewed
      const allLeads = await listLeads();
      const firstLead = allLeads.leads[0];
      if (firstLead) {
        await markLeadViewed(firstLead.id);
      }

      const result = await listLeads({ status: "viewed" });

      expect(result.leads).toHaveLength(1);
      expect(result.leads[0]?.status).toBe("viewed");
    });

    it("should respect limit parameter", async () => {
      const result = await listLeads({ limit: 2 });

      expect(result.leads).toHaveLength(2);
      expect(result.summary.total).toBe(3);
    });

    it("should sort leads by created date descending", async () => {
      const result = await listLeads();

      expect(result.leads).toHaveLength(3);
      // Most recent first
      expect(
        new Date(result.leads[0]!.createdAt).getTime()
      ).toBeGreaterThanOrEqual(new Date(result.leads[1]!.createdAt).getTime());
    });
  });

  describe("getLead", () => {
    it("should retrieve a lead by ID", async () => {
      const created = await createLead({
        type: "contact",
        source: "test",
        name: "Test Lead",
        email: "test@test.com",
      });

      const retrieved = await getLead(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe("Test Lead");
    });

    it("should return null for non-existent lead", async () => {
      const result = await getLead("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("markLeadViewed", () => {
    it("should mark a new lead as viewed", async () => {
      const created = await createLead({
        type: "contact",
        source: "test",
        name: "Test Lead",
        email: "test@test.com",
      });

      expect(created.status).toBe("new");

      const viewed = await markLeadViewed(created.id, "test-admin");

      expect(viewed).not.toBeNull();
      expect(viewed?.status).toBe("viewed");
      expect(viewed?.viewedAt).toBeDefined();
    });

    it("should not change status if already replied", async () => {
      const created = await createLead({
        type: "contact",
        source: "test",
        name: "Test Lead",
        email: "test@test.com",
      });

      await markLeadReplied(created.id, "Test reply");
      const result = await markLeadViewed(created.id);

      expect(result?.status).toBe("replied");
    });

    it("should return null for non-existent lead", async () => {
      const result = await markLeadViewed("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("saveLeadDraft", () => {
    it("should save a reply draft", async () => {
      const created = await createLead({
        type: "contact",
        source: "test",
        name: "Test Lead",
        email: "test@test.com",
      });

      const draft = "This is a draft reply";
      const updated = await saveLeadDraft(created.id, draft, "test-admin");

      expect(updated).not.toBeNull();
      expect(updated?.lastReplyDraft).toBe(draft);
    });

    it("should return null for non-existent lead", async () => {
      const result = await saveLeadDraft("non-existent-id", "draft");

      expect(result).toBeNull();
    });
  });

  describe("markLeadReplied", () => {
    it("should mark a lead as replied", async () => {
      const created = await createLead({
        type: "contact",
        source: "test",
        name: "Test Lead",
        email: "test@test.com",
      });

      const reply = "Thank you for your inquiry";
      const replied = await markLeadReplied(created.id, reply, "test-admin");

      expect(replied).not.toBeNull();
      expect(replied?.status).toBe("replied");
      expect(replied?.repliedAt).toBeDefined();
      expect(replied?.lastReplyDraft).toBe(reply);
    });

    it("should mark as replied without detail", async () => {
      const created = await createLead({
        type: "contact",
        source: "test",
        name: "Test Lead",
        email: "test@test.com",
      });

      const replied = await markLeadReplied(created.id, null, "test-admin");

      expect(replied).not.toBeNull();
      expect(replied?.status).toBe("replied");
      expect(replied?.repliedAt).toBeDefined();
    });

    it("should return null for non-existent lead", async () => {
      const result = await markLeadReplied("non-existent-id", "reply");

      expect(result).toBeNull();
    });
  });

  describe("getLeadWithEvents", () => {
    it("should retrieve lead with event timeline", async () => {
      const { getLeadWithEvents } = await import("@/lib/lead-store");

      const created = await createLead({
        type: "contact",
        source: "test",
        name: "Test Lead",
        email: "test@test.com",
      });

      await markLeadViewed(created.id);
      await saveLeadDraft(created.id, "Draft reply");
      await markLeadReplied(created.id, "Final reply");

      const result = await getLeadWithEvents(created.id);

      expect(result).not.toBeNull();
      expect(result?.lead.id).toBe(created.id);
      expect(result?.events).toBeDefined();
      expect(result?.events.length).toBeGreaterThan(0);

      // Check event actions
      const actions = result?.events.map((e) => e.action) || [];
      expect(actions).toContain("submitted");
      expect(actions).toContain("viewed");
      expect(actions).toContain("drafted");
      expect(actions).toContain("replied");
    });

    it("should return null for non-existent lead", async () => {
      const { getLeadWithEvents } = await import("@/lib/lead-store");

      const result = await getLeadWithEvents("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("field normalization", () => {
    it("should handle region/regions aliasing", async () => {
      const lead1 = await createLead({
        type: "contact",
        source: "test",
        name: "Lead 1",
        email: "lead1@test.com",
        region: "Nevada",
      });

      const lead2 = await createLead({
        type: "contact",
        source: "test",
        name: "Lead 2",
        email: "lead2@test.com",
        regions: "Australia",
      });

      expect(lead1.region).toBe("Nevada");
      expect(lead1.regions).toBe("Nevada");
      expect(lead2.region).toBe("Australia");
      expect(lead2.regions).toBe("Australia");
    });

    it("should handle additionalContext/context aliasing", async () => {
      const lead1 = await createLead({
        type: "contact",
        source: "test",
        name: "Lead 1",
        email: "lead1@test.com",
        additionalContext: "Extra context",
      });

      const lead2 = await createLead({
        type: "contact",
        source: "test",
        name: "Lead 2",
        email: "lead2@test.com",
        context: "Some context",
      });

      expect(lead1.additionalContext).toBe("Extra context");
      expect(lead1.context).toBe("Extra context");
      expect(lead2.additionalContext).toBe("Some context");
      expect(lead2.context).toBe("Some context");
    });

    it("should extract commodities from metadata if not provided directly", async () => {
      const lead = await createLead({
        type: "prospectivity_brief",
        source: "test",
        name: "Test Lead",
        email: "test@test.com",
        metadata: {
          commodities: ["gold", "copper"],
        },
      });

      expect(lead.commodities).toEqual(["gold", "copper"]);
    });

    it("should extract reference from metadata if not provided directly", async () => {
      const lead = await createLead({
        type: "consultation",
        source: "test",
        name: "Test Lead",
        email: "test@test.com",
        metadata: {
          reference: "CONSULT-202501-1234",
        },
      });

      expect(lead.reference).toBe("CONSULT-202501-1234");
    });
  });

  describe("markLeadContacted", () => {
    it("should mark a lead as contacted and record actor", async () => {
      const lead = await createLead({
        type: "contact",
        source: "test",
        name: "Test Lead",
        email: "test@example.com",
      });

      const updated = await markLeadContacted(lead.id, "admin@example.com");

      expect(updated).toBeDefined();
      expect(updated?.contactStatus).toBe("contacted");
      expect(updated?.lastContactedAt).toBeDefined();
      expect(updated?.lastContactedBy).toBe("admin@example.com");
    });

    it("should handle missing actor email", async () => {
      const lead = await createLead({
        type: "contact",
        source: "test",
        name: "Test Lead",
        email: "test@example.com",
      });

      const updated = await markLeadContacted(lead.id, null);

      expect(updated).toBeDefined();
      expect(updated?.contactStatus).toBe("contacted");
      expect(updated?.lastContactedAt).toBeDefined();
      expect(updated?.lastContactedBy).toBeNull();
    });

    it("should return null for non-existent lead", async () => {
      const result = await markLeadContacted("nonexistent-id");
      expect(result).toBeNull();
    });
  });
});

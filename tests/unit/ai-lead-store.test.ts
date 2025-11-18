import { describe, it, expect, beforeEach, vi } from "vitest";
import type { LeadCreateInput, LeadRecord } from "@/lib/lead-store";
import type { LeadAIInsight } from "@/lib/ai/ai-insights";

// Mock the Cloudflare context
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(() => null),
}));

// Clear the in-memory store between tests
const memoryStoreSymbol = Symbol.for("scanminers.leads.memoryStore");

describe("Lead AI Store Extensions", () => {
  let createLead: (input: LeadCreateInput) => Promise<LeadRecord>;
  let getLead: (id: string) => Promise<LeadRecord | null>;
  let saveLeadAIInsight: (
    id: string,
    insight: LeadAIInsight
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
    getLead = leadStore.getLead;
    saveLeadAIInsight = leadStore.saveLeadAIInsight;
  });

  describe("saveLeadAIInsight", () => {
    it("should save AI insight with all fields", async () => {
      const lead = await createLead({
        type: "contact",
        source: "test",
        name: "Jane Doe",
        email: "jane@example.com",
        message: "Looking for lithium exploration services",
      });

      const insight: LeadAIInsight = {
        summary:
          "High-value lead looking for lithium exploration in Western Australia",
        tags: ["lithium", "exploration", "western-australia"],
        valueTier: "high",
        urgency: "medium",
        fitScore: 85,
        confidence: 0.9,
      };

      const updated = await saveLeadAIInsight(lead.id, insight);

      expect(updated).toBeDefined();
      expect(updated?.aiSummary).toBe(insight.summary);
      expect(updated?.aiTags).toEqual(insight.tags);
      expect(updated?.aiValueTier).toBe("high");
      expect(updated?.aiUrgency).toBe("medium");
      expect(updated?.aiFitScore).toBe(85);
      expect(updated?.aiConfidence).toBe(0.9);
    });

    it("should handle partial AI insight updates", async () => {
      const lead = await createLead({
        type: "prospectivity_brief",
        source: "test",
        name: "John Smith",
        email: "john@example.com",
        message: "Need copper targeting study",
      });

      const insight: LeadAIInsight = {
        summary: "Standard prospectivity brief request",
        tags: ["copper", "prospectivity"],
        valueTier: "medium",
        urgency: "low",
        fitScore: 60,
        confidence: 0.7,
      };

      const updated = await saveLeadAIInsight(lead.id, insight);

      expect(updated?.aiSummary).toBe(insight.summary);
      expect(updated?.aiValueTier).toBe("medium");
      expect(updated?.aiUrgency).toBe("low");
    });

    it("should persist AI insights across retrieval", async () => {
      const lead = await createLead({
        type: "consultation",
        source: "test",
        name: "Alice Brown",
        email: "alice@example.com",
        message: "Need consultation on gold targets",
      });

      const insight: LeadAIInsight = {
        summary: "Consultation request for gold targeting methodology",
        tags: ["gold", "consultation", "targeting"],
        valueTier: "high",
        urgency: "high",
        fitScore: 92,
        confidence: 0.95,
      };

      await saveLeadAIInsight(lead.id, insight);

      // Retrieve the lead again
      const retrieved = await getLead(lead.id);

      expect(retrieved?.aiSummary).toBe(insight.summary);
      expect(retrieved?.aiTags).toEqual(insight.tags);
      expect(retrieved?.aiValueTier).toBe("high");
      expect(retrieved?.aiUrgency).toBe("high");
      expect(retrieved?.aiFitScore).toBe(92);
      expect(retrieved?.aiConfidence).toBe(0.95);
    });

    it("should handle empty tags array", async () => {
      const lead = await createLead({
        type: "contact",
        source: "test",
        name: "Bob Wilson",
        email: "bob@example.com",
        message: "General inquiry",
      });

      const insight: LeadAIInsight = {
        summary: "General inquiry with no specific services mentioned",
        tags: [],
        valueTier: "low",
        urgency: "low",
        fitScore: 30,
        confidence: 0.5,
      };

      const updated = await saveLeadAIInsight(lead.id, insight);

      expect(updated?.aiTags).toEqual([]);
      expect(updated?.aiValueTier).toBe("low");
    });

    it("should return null for non-existent lead", async () => {
      const insight: LeadAIInsight = {
        summary: "Test summary",
        tags: ["test"],
        valueTier: "medium",
        urgency: "medium",
        fitScore: 50,
        confidence: 0.6,
      };

      const result = await saveLeadAIInsight("non-existent-id", insight);

      expect(result).toBeNull();
    });
  });

  describe("AI field initialization", () => {
    it("should initialize new leads with null AI fields", async () => {
      const lead = await createLead({
        type: "contact",
        source: "test",
        name: "Test User",
        email: "test@example.com",
      });

      expect(lead.aiSummary).toBeNull();
      expect(lead.aiTags).toEqual([]);
      expect(lead.aiValueTier).toBeNull();
      expect(lead.aiUrgency).toBeNull();
      expect(lead.aiFitScore).toBeNull();
      expect(lead.aiConfidence).toBeNull();
    });
  });
});

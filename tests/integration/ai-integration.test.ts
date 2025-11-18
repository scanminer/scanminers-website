/**
 * Integration tests for AI functionality
 * These tests actually call OpenAI API - run with caution as they consume API credits
 *
 * Run with: npm test -- ai-integration
 */

import { describe, it, expect, beforeAll } from "vitest";
import { generateLeadSummaryAndTags } from "@/lib/ai/ai-insights";
import {
  generateProjectSummary,
  generateKickoffEmail,
  generateDataRequestEmail,
} from "@/lib/ai/ai-insights";
import type { LeadRecord } from "@/lib/lead-store";
import type { ProjectRecord } from "@/lib/project-store";

describe("AI Integration Tests", () => {
  beforeAll(() => {
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        "⚠️ OPENAI_API_KEY not set - skipping AI integration tests"
      );
    }
  });

  describe("Lead AI Classification", () => {
    it.skipIf(!process.env.OPENAI_API_KEY)(
      "should generate lead summary and tags from lead data",
      async () => {
      const leadData: LeadRecord = {
        id: "test-lead-1",
        name: "John Smith",
        email: "john.smith@greenmining.com",
        company: "Green Mining Corp",
        message:
          "We're exploring lithium deposits in Nevada and need help with prospectivity mapping. We have some regional magnetic data and historical drilling results. Timeline is urgent - need targets by Q2 2026.",
        source: "contact-form",
        type: "consultation" as const,
        status: "new",
        contactStatus: "not_contacted",
        commodities: [],
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewedAt: null,
        repliedAt: null,
        lastReplyDraft: null,
        lastContactedAt: null,
        lastContactedBy: null,
      };

      const result = await generateLeadSummaryAndTags(leadData);

      console.log("Lead AI Result:", JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result.summary).toBeTruthy();
      expect(typeof result.summary).toBe("string");
      expect(result.summary.length).toBeGreaterThan(50);

      expect(result.tags).toBeDefined();
      expect(Array.isArray(result.tags)).toBe(true);
      expect(result.tags.length).toBeGreaterThan(0);
      // Tags may include service types like "Prospectivity Brief" or commodities like "lithium"

      expect(result.valueTier).toMatch(/^(high|medium|low)$/);
      expect(result.urgency).toMatch(/^(high|medium|low)$/);
      expect(result.fitScore).toBeGreaterThanOrEqual(0);
      expect(result.fitScore).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    },
    30000
  ); // 30s timeout for API call

    it.skipIf(!process.env.OPENAI_API_KEY)(
      "should handle low-quality lead data gracefully",
      async () => {
      const leadData: LeadRecord = {
        id: "test-lead-2",
        name: "Test User",
        email: "test@test.com",
        message: "Hello",
        source: "contact-form",
        type: "contact" as const,
        status: "new",
        contactStatus: "not_contacted",
        commodities: [],
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewedAt: null,
        repliedAt: null,
        lastReplyDraft: null,
        lastContactedAt: null,
        lastContactedBy: null,
      };

      const result = await generateLeadSummaryAndTags(leadData);

      console.log("Low-quality Lead Result:", JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result.summary).toBeTruthy();
      expect(result.valueTier).toMatch(/^(high|medium|low)$/);
      expect(result.urgency).toMatch(/^(high|medium|low)$/);
    },
    30000
  );
  });

  describe("Project AI Summary", () => {
    it.skipIf(!process.env.OPENAI_API_KEY)(
      "should generate project summary from timeline",
      async () => {
      const project: ProjectRecord = {
        id: "test-project-1",
        leadId: "test-lead-1",
        clientName: "Green Valley Mining Ltd",
        projectName: "Pilbara Lithium Exploration",
        status: "active" as const,
        createdAt: new Date("2025-09-15").toISOString(),
        updatedAt: new Date("2025-11-15").toISOString(),
        aiProjectSummary: null,
      };

      const timeline = [
        {
          action: "note" as const,
          actor: "system",
          detail:
            "Project initiated. Client requested target generation for lithium exploration in Pilbara region.",
          createdAt: new Date("2025-09-15").toISOString(),
        },
        {
          action: "note" as const,
          actor: "admin",
          detail:
            "Received regional magnetic and gravity data. Data quality assessment complete.",
          createdAt: new Date("2025-09-20").toISOString(),
        },
        {
          action: "note" as const,
          actor: "admin",
          detail:
            "ML-based prospectivity modeling in progress. Using Sentinel-2 and Landsat imagery.",
          createdAt: new Date("2025-10-05").toISOString(),
        },
        {
          action: "note" as const,
          actor: "admin",
          detail:
            "Initial targets delivered. Client review scheduled for end of November.",
          createdAt: new Date("2025-11-10").toISOString(),
        },
      ];

      const summary = await generateProjectSummary(project, timeline, null);

      console.log("Project Summary:", summary);

      expect(summary).toBeDefined();
      expect(typeof summary).toBe("string");
      expect(summary.length).toBeGreaterThan(100);
      expect(summary.toLowerCase()).toContain("lithium");
      expect(summary.toLowerCase()).toContain("pilbara");
    },
    30000
  );
  });

  describe("Email Generation", () => {
    it.skipIf(!process.env.OPENAI_API_KEY)(
      "should generate kickoff email",
      async () => {
      const project: ProjectRecord = {
        id: "test-project-2",
        leadId: "test-lead-2",
        clientName: "Green Valley Mining Ltd",
        projectName: "Pilbara Lithium Exploration",
        status: "active" as const,
        createdAt: new Date("2025-11-15").toISOString(),
        updatedAt: new Date("2025-11-15").toISOString(),
        aiProjectSummary: null,
      };

      const clientInfo = {
        name: "Sarah Johnson",
        email: "sarah@greenmining.com",
        company: "Green Valley Mining Ltd",
      };

      const email = await generateKickoffEmail(project, clientInfo);

      console.log("Kickoff Email:", email);

      expect(email).toBeDefined();
      expect(typeof email).toBe("string");
      expect(email.length).toBeGreaterThan(100);
      expect(email.toLowerCase()).toContain("sarah");
      expect(email.toLowerCase()).toContain("pilbara");
    },
    30000
  );

    it.skipIf(!process.env.OPENAI_API_KEY)(
      "should generate data request email",
      async () => {
      const project: ProjectRecord = {
        id: "test-project-3",
        leadId: "test-lead-3",
        clientName: "Green Valley Mining Ltd",
        projectName: "Nevada Copper Exploration",
        status: "active" as const,
        createdAt: new Date("2025-11-15").toISOString(),
        updatedAt: new Date("2025-11-15").toISOString(),
        aiProjectSummary: null,
      };

      const email = await generateDataRequestEmail(project, null);

      console.log("Data Request Email:", email);

      expect(email).toBeDefined();
      expect(typeof email).toBe("string");
      expect(email.length).toBeGreaterThan(100);
      expect(email.toLowerCase()).toContain("data");
      // Should contain some checklist or request items
      expect(email).toMatch(/[-•*]/); // Contains bullet points
    },
    30000
  );
  });
});

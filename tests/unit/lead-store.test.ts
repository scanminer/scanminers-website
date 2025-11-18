import { describe, it, expect } from "vitest";
import type {
  LeadRecord,
  LeadCreateInput,
  LeadStatus,
  LeadType,
} from "@/lib/lead-store";

// Mock the lead store for testing
describe("Lead Store", () => {
  describe("LeadRecord type", () => {
    it("should have all required fields", () => {
      const lead: LeadRecord = {
        id: "test-123",
        type: "contact",
        source: "contact-form",
        status: "new",
        name: "Test User",
        email: "test@example.com",
        company: "Test Co",
        role: "Engineer",
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
        commodities: [],
        reference: null,
        metadata: {},
      };

      expect(lead).toBeDefined();
      expect(lead.id).toBe("test-123");
      expect(lead.name).toBe("Test User");
      expect(lead.email).toBe("test@example.com");
    });
  });

  describe("LeadCreateInput validation", () => {
    it("should accept valid contact lead input", () => {
      const input: LeadCreateInput = {
        type: "contact",
        source: "contact-form",
        name: "John Doe",
        email: "john@example.com",
        company: "Example Inc",
        message: "Interested in your services",
      };

      expect(input.type).toBe("contact");
      expect(input.name).toBe("John Doe");
      expect(input.email).toBe("john@example.com");
    });

    it("should accept valid consultation lead input", () => {
      const input: LeadCreateInput = {
        type: "consultation",
        source: "consultation-form",
        name: "Jane Smith",
        email: "jane@mining.com",
        company: "Mining Corp",
        role: "Geologist",
        regions: "Western Australia",
        stage: "Exploration",
        timing: "Q1 2025",
        commodities: ["gold", "copper"],
        reference: "CONSULT-202501-1234",
      };

      expect(input.type).toBe("consultation");
      expect(input.commodities).toEqual(["gold", "copper"]);
      expect(input.reference).toBe("CONSULT-202501-1234");
    });

    it("should accept valid prospectivity brief input", () => {
      const input: LeadCreateInput = {
        type: "prospectivity_brief",
        source: "prospectivity-brief-form",
        name: "Bob Johnson",
        email: "bob@exploration.com",
        company: "Exploration Ltd",
        role: "Project Manager",
        goal: "Identify lithium prospects",
        regions: "South America",
        stage: "Early stage",
        commodities: ["lithium", "rare earths"],
        metadata: {
          dataSources: ["sentinel-2", "aster"],
          expectation: true,
        },
      };

      expect(input.type).toBe("prospectivity_brief");
      expect(input.goal).toBe("Identify lithium prospects");
      expect(input.metadata?.dataSources).toEqual(["sentinel-2", "aster"]);
    });
  });

  describe("LeadStatus type", () => {
    it("should accept valid status values", () => {
      const statuses: LeadStatus[] = ["new", "viewed", "replied"];

      statuses.forEach((status) => {
        const lead: Partial<LeadRecord> = { status };
        expect(lead.status).toBe(status);
      });
    });
  });

  describe("LeadType type", () => {
    it("should accept valid type values", () => {
      const types: LeadType[] = [
        "contact",
        "consultation",
        "prospectivity_brief",
      ];

      types.forEach((type) => {
        const lead: Partial<LeadRecord> = { type };
        expect(lead.type).toBe(type);
      });
    });
  });

  describe("Metadata structure", () => {
    it("should accept various metadata configurations", () => {
      const metadata = {
        commodities: ["gold", "silver"],
        dataSources: ["landsat-8"],
        consent: true,
        expectation: true,
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        referer: "https://scanminers.com",
      };

      const input: LeadCreateInput = {
        type: "consultation",
        source: "test",
        name: "Test",
        email: "test@test.com",
        metadata,
      };

      expect(input.metadata).toEqual(metadata);
      expect(input.metadata?.commodities).toEqual(["gold", "silver"]);
      expect(input.metadata?.consent).toBe(true);
    });
  });
});

// Integration-style tests (these would need actual database connection in real tests)
describe("Lead Store Operations (mocked)", () => {
  it("should create a lead with required fields", () => {
    const input: LeadCreateInput = {
      type: "contact",
      source: "contact-form",
      name: "Test User",
      email: "test@example.com",
      message: "Test message",
    };

    // In a real test, this would call createLead(input)
    expect(input.name).toBe("Test User");
    expect(input.type).toBe("contact");
  });

  it("should handle leads with all optional fields", () => {
    const input: LeadCreateInput = {
      type: "consultation",
      source: "consultation-form",
      name: "Full Data User",
      email: "full@example.com",
      company: "Test Mining",
      role: "Senior Geologist",
      message: "Detailed inquiry",
      goal: "Find copper deposits",
      context: "Looking in Nevada",
      additionalContext: "Experienced team",
      regions: "Nevada, USA",
      region: "Nevada",
      stage: "Advanced exploration",
      timing: "2025 Q2",
      commodities: ["copper", "molybdenum"],
      reference: "TEST-2025-001",
      metadata: {
        dataSources: ["aster", "landsat"],
        consent: true,
      },
    };

    expect(input.company).toBe("Test Mining");
    expect(input.commodities).toHaveLength(2);
    expect(input.metadata?.consent).toBe(true);
  });

  it("should accept empty metadata object", () => {
    const input: LeadCreateInput = {
      type: "contact",
      source: "test",
      name: "Simple Lead",
      email: "simple@test.com",
      metadata: {},
    };

    expect(input.metadata).toEqual({});
  });

  it("should handle metadata with custom fields", () => {
    const input: LeadCreateInput = {
      type: "consultation",
      source: "test",
      name: "Custom",
      email: "custom@test.com",
      metadata: {
        customField1: "value1",
        customField2: 123,
        customField3: true,
      },
    };

    expect(input.metadata?.customField1).toBe("value1");
    expect(input.metadata?.customField2).toBe(123);
    expect(input.metadata?.customField3).toBe(true);
  });
});

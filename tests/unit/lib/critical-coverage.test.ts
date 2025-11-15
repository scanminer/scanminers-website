import { describe, expect, it } from "vitest";
import {
  CRITICAL_MINERAL_BLUEPRINT,
  aggregateCommoditySummaries,
  buildCriticalCoverageRows,
} from "../../../lib/critical-coverage";

const mockInsights = [
  {
    title: "Lithium brine targeting",
    url: "/insights/lithium-brine",
    summary: "Lithium exploration note",
    region: "Argentina",
    publishedAt: "2024-01-01",
    commodities: ["Lithium"],
  },
  {
    title: "Nickel pattern detection",
    url: "/insights/nickel-detection",
    summary: "Nickel workflows",
    region: "Labrador",
    publishedAt: "2024-02-10",
    commodities: ["Nickel"],
  },
];

const mockCaseStudies = [
  {
    title: "Lithium case rollout",
    url: "/case-studies/lithium-rollout",
    summary: "Lithium pilot",
    region: "Chile",
    publishedAt: "2023-12-15",
    commodities: ["Lithium"],
  },
  {
    title: "Cobalt ESG telemetry",
    url: "/case-studies/cobalt-esg",
    summary: "Cobalt ESG",
    region: "DRC",
    publishedAt: "2023-11-11",
    commodities: ["Cobalt"],
  },
  {
    title: "Cobalt supply chain dashboard",
    url: "/case-studies/cobalt-supply",
    summary: "Cobalt supply chain",
    region: "Indonesia",
    publishedAt: "2024-03-01",
    commodities: ["Cobalt"],
  },
];

describe("critical coverage helpers", () => {
  it("aggregates docs into critical mineral rows", () => {
    const summaries = aggregateCommoditySummaries([
      { docs: mockInsights, type: "Insight" },
      { docs: mockCaseStudies, type: "Case Study" },
    ]);

    expect(summaries.get("lithium")?.docs).toHaveLength(2);
    expect(summaries.get("cobalt")?.docs).toHaveLength(2);

    const rows = buildCriticalCoverageRows(CRITICAL_MINERAL_BLUEPRINT, summaries);
    const lithiumRow = rows.find((row) => row.key === "lithium");
    const cobaltRow = rows.find((row) => row.key === "cobalt");
    const nickelRow = rows.find((row) => row.key === "nickel");
    const rareEarthRow = rows.find((row) => row.key === "rare-earths");

    expect(lithiumRow).toBeDefined();
    expect(lithiumRow?.docsCount).toBe(2);
    expect(lithiumRow?.coverage.sort()).toEqual(["Argentina", "Chile"].sort());
    expect(lithiumRow?.docTypes).toContain("Insight");
    expect(lithiumRow?.docTypes).toContain("Case Study");
    expect(lithiumRow?.maturity).toBe("mature");

    expect(cobaltRow).toBeDefined();
    expect(cobaltRow?.coverage.sort()).toEqual(["DRC", "Indonesia"].sort());
    expect(cobaltRow?.maturity).toBe("mature");

    expect(nickelRow?.maturity).toBe("emerging");
    expect(rareEarthRow?.maturity).toBe("scouting");
  });
});

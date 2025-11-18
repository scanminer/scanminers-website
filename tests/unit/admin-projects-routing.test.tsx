import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(() => null),
}));

const leadStoreSymbol = Symbol.for("scanminers.leads.memoryStore");
const projectStoreSymbol = Symbol.for("scanminers.projects.memoryStore");

function resetStores() {
  const globalAny = globalThis as typeof globalThis & {
    [leadStoreSymbol]?: unknown;
    [projectStoreSymbol]?: unknown;
  };
  delete globalAny[leadStoreSymbol];
  delete globalAny[projectStoreSymbol];
}

describe("Admin Projects routes", () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    resetStores();
  });

  it("renders /admin/projects with the newly created project", async () => {
    const { createLead } = await import("@/lib/lead-store");
    const { createProjectFromLead } = await import("@/lib/project-store");

    const lead = await createLead({
      type: "contact",
      source: "unit-test",
      name: "Map Pilot",
      email: "pilot@example.com",
      message: "Need mapping",
    });
    const project = await createProjectFromLead(lead);

    const Page = (await import("@/app/admin/projects/page")).default;
    const element = await Page({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(<>{element}</>);

    expect(html).toContain("Projects");
    expect(html).toContain(project.projectName);
    expect(html).toContain(project.clientName);
  });

  it("renders /admin/projects/[id] with timeline entries", async () => {
    const { createLead } = await import("@/lib/lead-store");
    const { createProjectFromLead, addProjectTimelineEntry } = await import(
      "@/lib/project-store"
    );

    const lead = await createLead({
      type: "contact",
      source: "unit-test",
      name: "Timeline Owner",
      email: "timeline@example.com",
    });
    const project = await createProjectFromLead(lead);
    await addProjectTimelineEntry(project.id, "Signed MSA");

    const Page = (await import("@/app/admin/projects/[id]/page")).default;
    const element = await Page({
      params: Promise.resolve({ id: project.id }),
    });
    const html = renderToStaticMarkup(<>{element}</>);

    expect(html).toContain(project.projectName);
    expect(html).toContain("Signed MSA");
    expect(html).toContain("Add timeline update");
  });
});

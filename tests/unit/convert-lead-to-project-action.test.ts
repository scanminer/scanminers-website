import { describe, it, expect, beforeEach, vi } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

const requireAdminSession = vi.fn();
vi.mock("@/lib/admin-session", () => ({ requireAdminSession }));

const getLead = vi.fn();
vi.mock("@/lib/lead-store", () => ({ getLead }));

const createProjectFromLead = vi.fn();
const addProjectTimelineEntry = vi.fn();
vi.mock("@/lib/project-store", () => ({
  createProjectFromLead,
  addProjectTimelineEntry,
}));

const reportServerError = vi.fn();
vi.mock("@/lib/server-logger", () => ({ reportServerError }));

describe("convertLeadToProjectAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a project, logs timeline entry, and revalidates pages", async () => {
    const { convertLeadToProjectAction } = await import(
      "@/app/admin/leads/[id]/actions"
    );

    requireAdminSession.mockResolvedValueOnce(undefined);
    getLead.mockResolvedValueOnce({ id: "lead-123", name: "Case" });
    createProjectFromLead.mockResolvedValueOnce({ id: "proj-789" });

    const result = await convertLeadToProjectAction("lead-123");

    expect(requireAdminSession).toHaveBeenCalledTimes(1);
    expect(createProjectFromLead).toHaveBeenCalledWith(
      expect.objectContaining({ id: "lead-123" })
    );
    expect(addProjectTimelineEntry).toHaveBeenCalledWith(
      "proj-789",
      "Project created from lead conversion"
    );
    expect(result).toEqual({ projectId: "proj-789" });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/leads");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/projects");
  });

  it("throws when the lead does not exist", async () => {
    const { convertLeadToProjectAction } = await import(
      "@/app/admin/leads/[id]/actions"
    );

    requireAdminSession.mockResolvedValueOnce(undefined);
    getLead.mockResolvedValueOnce(null);

    await expect(convertLeadToProjectAction("missing")).rejects.toThrow(
      "Lead not found."
    );
    expect(reportServerError).toHaveBeenCalled();
  });
});

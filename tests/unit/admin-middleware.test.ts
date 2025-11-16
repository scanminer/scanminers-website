import { describe, it, expect, beforeEach, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

const adminConfig = {
  allowedEmails: [],
  allowedDomains: [],
  allowedGithubHandles: [],
  bypass: false,
  passwordFallbackEnabled: false,
  githubClientId: "",
  githubClientSecret: "",
  githubProviderEnabled: false,
  hasAllowlist: true,
};

vi.mock("@/lib/admin-auth", () => ({
  resolveAdminAuthConfig: () => adminConfig,
}));

function createRequest(path: string): NextRequest {
  const url = new URL(`https://example.com${path}`);
  return {
    nextUrl: url,
    url: url.toString(),
  } as unknown as NextRequest;
}

describe("admin middleware", () => {
  beforeEach(async () => {
    const { getToken } = await import("next-auth/jwt");
    vi.mocked(getToken).mockReset();
  });

  it("redirects unauthenticated users to the login page", async () => {
    const { getToken } = await import("next-auth/jwt");
    vi.mocked(getToken).mockResolvedValue(null);
    const { middleware } = await import("../../middleware");

    const res = await middleware(createRequest("/admin/leads?status=new"));

    expect(res?.status).toBe(307);
    expect(res?.headers.get("location")).toBe("https://example.com/admin/login?next=%2Fadmin%2Fleads%3Fstatus%3Dnew");
  });

  it("lets authenticated admins reach protected routes", async () => {
    const { getToken } = await import("next-auth/jwt");
    vi.mocked(getToken).mockResolvedValue({ isAdmin: true });
    const { middleware } = await import("../../middleware");

    const res = await middleware(createRequest("/admin"));

    expect(res?.headers.get("location")).toBeNull();
    expect(res?.status).toBe(200);
  });

  it("redirects signed-in admins away from the login page", async () => {
    const { getToken } = await import("next-auth/jwt");
    vi.mocked(getToken).mockResolvedValue({ isAdmin: true });
    const { middleware } = await import("../../middleware");

    const res = await middleware(createRequest("/admin/login?next=%2Fadmin%2Fsystem"));

    expect(res?.status).toBe(307);
    expect(res?.headers.get("location")).toBe("https://example.com/admin/system");
  });
});

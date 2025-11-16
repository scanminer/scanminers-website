import { afterEach, describe, expect, it, vi } from "vitest";

async function loadHelper() {
  const { authenticateLegacyPassword } = await import("@/auth");
  return authenticateLegacyPassword;
}

describe("legacy password login", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  function stubPasswordEnv() {
    vi.stubEnv("ENABLE_ADMIN_PASSWORD_LOGIN", "true");
    vi.stubEnv("ADMIN_PASS", "qa-secret");
    vi.stubEnv("ADMIN_USER", "QA Admin");
    vi.stubEnv("ADMIN_ACTOR_NAME", "QA Admin");
    vi.stubEnv("NEXTAUTH_GITHUB_CLIENT_ID", "");
    vi.stubEnv("NEXTAUTH_GITHUB_CLIENT_SECRET", "");
    vi.resetModules();
  }

  it("authenticates with the correct password when enabled", async () => {
    stubPasswordEnv();
    const authenticateLegacyPassword = await loadHelper();
    const user = authenticateLegacyPassword("qa-secret");
    expect(user).toMatchObject({
      name: "QA Admin",
      email: expect.stringContaining("@"),
    });
  });

  it("rejects invalid passwords", async () => {
    stubPasswordEnv();
    const authenticateLegacyPassword = await loadHelper();
    const user = authenticateLegacyPassword("nope");
    expect(user).toBeNull();
  });
});

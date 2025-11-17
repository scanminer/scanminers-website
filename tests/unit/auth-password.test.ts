import { afterEach, describe, expect, it, vi } from "vitest";

async function loadHelper() {
  const { authenticateAdminCredentials } = await import("@/auth");
  return authenticateAdminCredentials;
}

describe("admin credentials authentication", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  function stubCredentialsEnv() {
    vi.stubEnv("ENABLE_ADMIN_PASSWORD_LOGIN", "true");
    vi.stubEnv("ADMIN_PASS", "qa-secret");
    vi.stubEnv("ADMIN_USER", "qa-admin");
    vi.stubEnv("ADMIN_ACTOR_NAME", "QA Admin");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_SECRET", "");
    vi.resetModules();
  }

  it("authenticates with the correct username and password", async () => {
    stubCredentialsEnv();
    const authenticateAdminCredentials = await loadHelper();
    const user = authenticateAdminCredentials("qa-admin", "qa-secret");
    expect(user).toMatchObject({
      name: "QA Admin",
      email: expect.stringContaining("@"),
    });
  });

  it("rejects invalid passwords", async () => {
    stubCredentialsEnv();
    const authenticateAdminCredentials = await loadHelper();
    const user = authenticateAdminCredentials("qa-admin", "wrong-password");
    expect(user).toBeNull();
  });

  it("rejects invalid usernames", async () => {
    stubCredentialsEnv();
    const authenticateAdminCredentials = await loadHelper();
    const user = authenticateAdminCredentials("wrong-user", "qa-secret");
    expect(user).toBeNull();
  });

  it("is case-sensitive for usernames", async () => {
    stubCredentialsEnv();
    const authenticateAdminCredentials = await loadHelper();
    const user = authenticateAdminCredentials("QA-ADMIN", "qa-secret");
    expect(user).toBeNull(); // Should fail - username case matters
  });

  it("uses 'admin' as default username when ADMIN_USER not set", async () => {
    vi.stubEnv("ENABLE_ADMIN_PASSWORD_LOGIN", "true");
    vi.stubEnv("ADMIN_PASS", "qa-secret");
    vi.stubEnv("ADMIN_USER", ""); // Empty - should default to 'admin'
    vi.stubEnv("ADMIN_ACTOR_NAME", "Default Admin");
    vi.resetModules();
    
    const authenticateAdminCredentials = await loadHelper();
    const user = authenticateAdminCredentials("admin", "qa-secret");
    expect(user).toMatchObject({
      name: "Default Admin",
      email: expect.stringContaining("@"),
    });
  });
});

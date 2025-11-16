import { describe, expect, it } from "vitest";
import { isUserAllowlisted, type AdminAuthConfig } from "@/lib/admin-auth";

const baseConfig: AdminAuthConfig = {
  allowedEmails: [],
  allowedDomains: [],
  allowedGithubHandles: [],
  bypass: false,
  passwordFallbackEnabled: false,
  githubClientId: "",
  githubClientSecret: "",
  githubProviderEnabled: false,
  hasAllowlist: false,
};

describe("isUserAllowlisted", () => {
  it("matches exact email", () => {
    const config: AdminAuthConfig = {
      ...baseConfig,
      allowedEmails: ["ops@scanminers.com"],
      hasAllowlist: true,
    };
    expect(isUserAllowlisted({ email: "ops@scanminers.com" }, config)).toBe(true);
    expect(isUserAllowlisted({ email: "OPS@SCANMINERS.COM" }, config)).toBe(true);
  });

  it("matches GitHub handle", () => {
    const config: AdminAuthConfig = {
      ...baseConfig,
      allowedGithubHandles: ["scanminers"],
      hasAllowlist: true,
    };
    expect(isUserAllowlisted({ login: "scanminers" }, config)).toBe(true);
    expect(isUserAllowlisted({ login: "ScanMiners" }, config)).toBe(true);
  });

  it("matches email domain", () => {
    const config: AdminAuthConfig = {
      ...baseConfig,
      allowedDomains: ["scanminers.com"],
      hasAllowlist: true,
    };
    expect(isUserAllowlisted({ email: "team@scanminers.com" }, config)).toBe(true);
    expect(isUserAllowlisted({ email: "team@other.com" }, config)).toBe(false);
  });

  it("matches email domains case-insensitively", () => {
    const config: AdminAuthConfig = {
      ...baseConfig,
      allowedDomains: ["scanminers.com"],
      hasAllowlist: true,
    };
    expect(isUserAllowlisted({ email: "Ops@Scanminers.com" }, config)).toBe(true);
  });

  it("denies users without identifiers when allowlist is set", () => {
    const config: AdminAuthConfig = {
      ...baseConfig,
      allowedEmails: ["ops@scanminers.com"],
      hasAllowlist: true,
    };
    expect(isUserAllowlisted({}, config)).toBe(false);
    expect(isUserAllowlisted(null, config)).toBe(false);
  });

  it("denies when allowlist empty and no bypass", () => {
    expect(isUserAllowlisted({ email: "anyone@scanminers.com" }, baseConfig)).toBe(false);
  });

  it("allows all when bypass flag true", () => {
    const config: AdminAuthConfig = { ...baseConfig, bypass: true };
    expect(isUserAllowlisted({ email: "foo@example.com" }, config)).toBe(true);
  });
});

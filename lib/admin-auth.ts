const LIST_DELIMITER = /[\n,]+/g;

export type AdminAuthConfig = {
  allowedEmails: string[];
  allowedDomains: string[];
  allowedGithubHandles: string[];
  bypass: boolean;
  passwordFallbackEnabled: boolean;
  githubClientId: string;
  githubClientSecret: string;
  githubProviderEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
  googleProviderEnabled: boolean;
  hasAllowlist: boolean;
};

function normalizeEntry(value?: string | null): string {
  return (value ?? "").trim().toLowerCase().replace(/^@/, "");
}

function parseList(value?: string | null): string[] {
  if (!value) return [];
  return value.split(LIST_DELIMITER).map(normalizeEntry).filter(Boolean);
}

export function resolveAdminAuthConfig(): AdminAuthConfig {
  const allowedEmails = parseList(
    process.env.ADMIN_ALLOWED_EMAILS ?? process.env.ADMIN_ALLOWLIST ?? ""
  );
  const allowedDomains = parseList(
    process.env.ADMIN_ALLOWED_EMAIL_DOMAINS ?? ""
  );
  const allowedGithubHandles = parseList(
    process.env.ADMIN_ALLOWED_GITHUB_LOGINS ?? ""
  );
  const bypass =
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_ADMIN_WITHOUT_AUTH === "true";
  const passwordFallbackEnabled = Boolean(
    process.env.ADMIN_PASS &&
      process.env.ENABLE_ADMIN_PASSWORD_LOGIN !== "false"
  );
  const githubClientId = (
    process.env.NEXTAUTH_GITHUB_CLIENT_ID ??
    process.env.GITHUB_OAUTH_CLIENT_ID ??
    ""
  ).trim();
  const githubClientSecret = (
    process.env.NEXTAUTH_GITHUB_CLIENT_SECRET ??
    process.env.GITHUB_OAUTH_CLIENT_SECRET ??
    ""
  ).trim();
  const githubProviderEnabled = Boolean(githubClientId && githubClientSecret);
  const googleClientId = (process.env.GOOGLE_CLIENT_ID ?? "").trim();
  const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET ?? "").trim();
  const googleProviderEnabled = Boolean(googleClientId && googleClientSecret);
  const hasAllowlist = Boolean(
    allowedEmails.length || allowedDomains.length || allowedGithubHandles.length
  );

  return {
    allowedEmails,
    allowedDomains,
    allowedGithubHandles,
    bypass,
    passwordFallbackEnabled,
    githubClientId,
    githubClientSecret,
    githubProviderEnabled,
    googleClientId,
    googleClientSecret,
    googleProviderEnabled,
    hasAllowlist,
  };
}

type MaybeUser =
  | {
      email?: string | null;
      login?: string | null;
    }
  | null
  | undefined;

export function isUserAllowlisted(
  user: MaybeUser,
  config?: AdminAuthConfig
): boolean {
  const settings = config ?? resolveAdminAuthConfig();
  if (settings.bypass) return true;
  const email = normalizeEntry(user?.email);
  const login = normalizeEntry(user?.login);

  if (!settings.hasAllowlist) {
    // Without an explicit allowlist we deny by default (unless bypassing).
    return false;
  }

  if (email && settings.allowedEmails.includes(email)) {
    return true;
  }

  if (login && settings.allowedGithubHandles.includes(login)) {
    return true;
  }

  if (email) {
    const [, domain] = email.split("@");
    if (domain && settings.allowedDomains.includes(domain)) {
      return true;
    }
  }

  return false;
}

export function getAllowlistSummary(config?: AdminAuthConfig) {
  const settings = config ?? resolveAdminAuthConfig();
  return {
    emails: settings.allowedEmails,
    domains: settings.allowedDomains,
    github: settings.allowedGithubHandles,
    hasCustomRules: settings.hasAllowlist,
    bypass: settings.bypass,
    passwordFallbackEnabled: settings.passwordFallbackEnabled,
  };
}

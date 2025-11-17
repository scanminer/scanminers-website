import type { NextAuthOptions, User } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { isUserAllowlisted, resolveAdminAuthConfig } from "@/lib/admin-auth";

const adminAuthConfig = resolveAdminAuthConfig();

/**
 * Authenticates admin credentials against environment variables.
 * This is the primary, reliable authentication method for admin access.
 *
 * @param username - The username to check (defaults to ADMIN_USER env var)
 * @param password - The password to verify against ADMIN_PASS env var
 * @returns User object if authentication succeeds, null otherwise
 */
export function authenticateAdminCredentials(
  username?: string | null,
  password?: string | null
): (User & { login?: string | null }) | null {
  const envUser = process.env.ADMIN_USER || "admin";
  const envPass = process.env.ADMIN_PASS;
  const actorName = process.env.ADMIN_ACTOR_NAME || envUser;

  // Require password to be configured
  if (!envPass) {
    console.warn(
      "[Admin Auth] ADMIN_PASS not configured - admin login unavailable"
    );
    return null;
  }

  // Validate credentials
  if (!username || !password) {
    return null;
  }
  if (username !== envUser) {
    return null;
  }
  if (password !== envPass) {
    return null;
  }

  // Authentication successful
  const email = `${envUser.replace(/\s+/g, "-").toLowerCase()}@admin.local`;
  return {
    id: `admin-${envUser}`,
    name: actorName,
    email,
    login: envUser,
  } satisfies User & { login?: string | null };
}

// Legacy alias for backward compatibility
export const authenticateLegacyPassword = authenticateAdminCredentials;

const providers: NextAuthOptions["providers"] = [];

// Primary authentication: Admin Credentials (username + password)
// This is the main, reliable way to access the admin panel
const envPass = process.env.ADMIN_PASS;
const enablePasswordLogin = process.env.ENABLE_ADMIN_PASSWORD_LOGIN !== "false";

if (enablePasswordLogin) {
  providers.push(
    Credentials({
      id: "credentials",
      name: "Admin Password",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!envPass) {
          console.error(
            "[Admin Auth] ADMIN_PASS not set - cannot authenticate"
          );
          throw new Error(
            "Admin authentication not configured. Please set ADMIN_PASS environment variable."
          );
        }
        return authenticateAdminCredentials(
          credentials?.username,
          credentials?.password
        );
      },
    })
  );
}

// Secondary/optional authentication: GitHub OAuth
// This is treated as an optional convenience method
if (adminAuthConfig.githubProviderEnabled) {
  providers.push(
    GitHub({
      clientId: adminAuthConfig.githubClientId,
      clientSecret: adminAuthConfig.githubClientSecret,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        } satisfies User & { login?: string | null };
      },
    })
  );
}

// Third authentication method: Google OAuth (Google Workspace)
// Uses company domain allowlist for access control
if (adminAuthConfig.googleProviderEnabled) {
  providers.push(
    Google({
      clientId: adminAuthConfig.googleClientId,
      clientSecret: adminAuthConfig.googleClientSecret,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    })
  );
}

// Fallback: If no providers configured, add a placeholder that explains the issue
if (providers.length === 0) {
  providers.push(
    Credentials({
      id: "unconfigured",
      name: "Admin Access Not Configured",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        throw new Error(
          "No admin authentication methods configured. Set ADMIN_PASS (and optionally GitHub OAuth credentials) in environment."
        );
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Dev bypass for local development (never allow in production)
      if (adminAuthConfig.bypass) {
        console.warn(
          "[Admin Auth] BYPASS MODE ENABLED - allowing all logins (dev only!)"
        );
        return true;
      }

      const provider = account?.provider;

      // Credentials provider: always succeeds if authorize() returned a user
      if (provider === "credentials") {
        return true;
      }

      // GitHub provider: check allowlist
      if (provider === "github") {
        const allowed = isUserAllowlisted(
          { email: user.email, login: user.login },
          adminAuthConfig
        );
        if (!allowed) {
          console.warn(
            `[Admin Auth] GitHub user ${
              user.email || user.login
            } not in allowlist`
          );
        }
        return allowed;
      }

      // Google provider: check allowlist (typically domain-based for Workspace)
      if (provider === "google") {
        const allowed = isUserAllowlisted(
          { email: user.email, login: null },
          adminAuthConfig
        );
        if (!allowed) {
          console.warn(
            `[Admin Auth] Google user ${user.email} not in allowlist`
          );
        }
        return allowed;
      }

      // Unknown provider or unconfigured
      console.warn(`[Admin Auth] Unknown provider: ${provider}`);
      return false;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const provider =
          account?.provider ?? (token.provider as string | undefined);
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image ?? token.picture;
        token.login = user.login ?? token.login;
        token.provider = provider;

        // Determine admin status based on provider
        if (provider === "credentials") {
          // Credentials provider = admin (already validated in authorize())
          token.isAdmin = true;
        } else if (provider === "github") {
          // GitHub = check allowlist
          token.isAdmin = isUserAllowlisted(
            { email: user.email, login: user.login },
            adminAuthConfig
          );
        } else if (provider === "google") {
          // Google = check allowlist (typically domain-based)
          token.isAdmin = isUserAllowlisted(
            { email: user.email, login: null },
            adminAuthConfig
          );
        } else {
          token.isAdmin = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (
          session.user as typeof session.user & {
            login?: string | null;
            isAdmin?: boolean;
          }
        ).login = (token.login as string | undefined) ?? session.user.login;
        (
          session.user as typeof session.user & {
            login?: string | null;
            isAdmin?: boolean;
          }
        ).isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
};

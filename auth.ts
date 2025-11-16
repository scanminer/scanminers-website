import type { NextAuthOptions, User } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { isUserAllowlisted, resolveAdminAuthConfig } from "@/lib/admin-auth";

const adminAuthConfig = resolveAdminAuthConfig();

export function authenticateLegacyPassword(password?: string | null): (User & { login?: string | null }) | null {
  const envPass = process.env.ADMIN_PASS;
  if (!envPass || !password) {
    return null;
  }
  if (password !== envPass) {
    return null;
  }
  const username = process.env.ADMIN_ACTOR_NAME || process.env.ADMIN_USER || "Admin";
  const email =
    process.env.ADMIN_LOGIN_EMAIL || `${username.replace(/\s+/g, "-").toLowerCase()}@scanminers.local`;
  return {
    id: "legacy-password",
    name: username,
    email,
    login: process.env.ADMIN_USER || username,
  } satisfies User & { login?: string | null };
}

const providers: NextAuthOptions["providers"] = [];

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

if (adminAuthConfig.passwordFallbackEnabled || !providers.length) {
  providers.push(
    Credentials({
      id: adminAuthConfig.passwordFallbackEnabled ? "legacy-password" : "unconfigured",
      name: adminAuthConfig.passwordFallbackEnabled ? "Legacy password" : "Admin access not configured",
      credentials: {
        password: { label: "Admin password", type: "password" },
      },
      async authorize(credentials) {
        const envPass = process.env.ADMIN_PASS;
        if (!envPass) {
          if (!adminAuthConfig.passwordFallbackEnabled) {
            throw new Error("No admin auth providers configured. Set GitHub OAuth envs or ADMIN_PASS.");
          }
          return null;
        }
        return authenticateLegacyPassword(credentials?.password);
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
      if (adminAuthConfig.bypass) return true;
      if (account?.provider === "legacy-password") {
        return adminAuthConfig.passwordFallbackEnabled;
      }
      if (account?.provider === "github") {
        return isUserAllowlisted({ email: user.email, login: user.login }, adminAuthConfig);
      }
      return false;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const provider = account?.provider ?? (token.provider as string | undefined);
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image ?? token.picture;
        token.login = user.login ?? token.login;
        token.provider = provider;
        if (provider === "legacy-password") {
          token.isAdmin = true;
        } else if (provider === "github") {
          token.isAdmin = isUserAllowlisted({ email: user.email, login: user.login }, adminAuthConfig);
        } else {
          token.isAdmin = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { login?: string | null; isAdmin?: boolean }).login =
          (token.login as string | undefined) ?? session.user.login;
        (session.user as typeof session.user & { login?: string | null; isAdmin?: boolean }).isAdmin = Boolean(
          token.isAdmin
        );
      }
      return session;
    },
  },
};

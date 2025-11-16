import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      login?: string | null;
      isAdmin?: boolean;
    };
  }

  interface User {
    login?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    login?: string | null;
    isAdmin?: boolean;
    provider?: string;
  }
}

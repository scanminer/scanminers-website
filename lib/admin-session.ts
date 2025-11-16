import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/auth";

const testSession: Session = {
  expires: "2099-01-01T00:00:00.000Z",
  user: {
    name: "Test Admin",
    email: "test@scanminers.com",
    isAdmin: true,
  },
};

export async function getAdminSession() {
  if (process.env.NODE_ENV === "test") {
    return testSession;
  }
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session?.user?.isAdmin) {
    throw new Error("Admin session required");
  }
  return session;
}

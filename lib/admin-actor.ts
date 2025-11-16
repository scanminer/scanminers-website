import { getAdminSession } from "@/lib/admin-session";

export async function getAdminActorName(): Promise<string> {
  const session = await getAdminSession();
  return (
    session?.user?.name ||
    session?.user?.login ||
    session?.user?.email ||
    process.env.ADMIN_ACTOR_NAME ||
    process.env.ADMIN_USER ||
    "admin"
  );
}

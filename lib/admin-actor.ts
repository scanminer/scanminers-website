export function getAdminActorName(): string {
  return process.env.ADMIN_ACTOR_NAME || process.env.ADMIN_USER || "admin";
}

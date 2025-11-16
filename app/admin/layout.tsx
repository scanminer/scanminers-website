import type { ReactNode } from "react";
import AdminShell from "@/components/admin/admin-layout";
import { AdminSessionProvider } from "@/components/admin/admin-session-provider";
import { getAdminSession } from "@/lib/admin-session";

export const metadata = {
  title: "Admin",
};

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  return (
    <AdminSessionProvider session={session}>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}

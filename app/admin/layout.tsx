import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "Admin",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <nav className="mt-4 flex gap-4 text-sm">
          <Link className="hover:underline" href="/admin">Review Queue</Link>
          <Link className="hover:underline" href="/admin/system">System</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}

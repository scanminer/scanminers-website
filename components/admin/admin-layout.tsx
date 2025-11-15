"use client"

import Link from "next/link"
import { Menu, PanelsTopLeft, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { AdminThemeBoot } from "@/components/admin/admin-theme-boot"
import { useRouter } from "next/navigation"
import { useState } from "react"

const nav = [
  { href: "/admin", label: "Review Queue" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/brand", label: "Brand" },
  { href: "/admin/drafts", label: "Drafts" },
  { href: "/admin/system", label: "System" },
]

function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch("/api/admin/login", { method: "DELETE" })
    } finally {
      setLoading(false)
      router.push("/admin/login")
      router.refresh()
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading} className="gap-1">
      <LogOut className="h-4 w-4" />
      {loading ? "Signing out" : "Sign out"}
    </Button>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <AdminThemeBoot />
      {/* Sidebar (lg+) */}
      <aside className="hidden lg:flex flex-col border-r bg-card">
        <div className="h-16 flex items-center gap-2 px-4 border-b">
          <PanelsTopLeft className="h-5 w-5" />
          <span className="font-medium">Admin</span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-bg/60"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t flex items-center justify-between gap-2">
          <ModeToggle />
          <LogoutButton />
        </div>
      </aside>

      {/* Topbar + content */}
      <div className="flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-3">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <div className="h-16 flex items-center gap-2 px-4 border-b">
                  <PanelsTopLeft className="h-5 w-5" />
                  <span className="font-medium">Admin</span>
                </div>
                <nav className="p-2 space-y-1">
                  {nav.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      className="block rounded-xl px-3 py-2 text-sm hover:bg-bg/60"
                    >
                      {n.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <span className="font-medium">Admin</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <ModeToggle />
            <LogoutButton />
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

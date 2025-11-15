"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "@/components/Search";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileMenu, MobileMenuButton } from "@/components/mobile-menu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Slim accent line with gradient */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-gradient-to-r from-brand-blue-deep via-brand-orange-terrain to-brand-green-mineral pointer-events-none" />

      <header className="sticky top-1 z-40 border-b border-border/40 bg-background/95 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo with enhanced styling */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue-deep to-brand-green-mineral shadow-md">
              <span className="text-base font-bold text-white">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-fg transition-colors group-hover:text-primary">
              Scanminers
            </span>
          </Link>

          {/* Main Navigation - Desktop */}
          <div className="hidden items-center gap-6 lg:flex">
            <Link
              href="/about"
              className="group relative text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              About
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/technologies"
              className="group relative text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              Technologies
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/insights"
              className="group relative text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              Insights
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/case-studies"
              className="group relative text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              Case Studies
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/contact"
              className="group relative text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              Contact
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
          </div>

          {/* Right side: CTAs + Utilities */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/prospectivity-brief"
              className="hidden rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-2 text-xs font-bold text-primary transition-all hover:border-primary/50 hover:bg-primary/10 sm:inline-flex"
            >
              Free Brief
            </Link>
            <Link
              href="/consultation"
              className="hidden rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-secondary-fg shadow-md transition-all hover:bg-secondary/90 hover:shadow-lg sm:inline-flex"
            >
              Consult
            </Link>
            <div className="flex items-center gap-2">
              <Search />
              <ModeToggle />
              <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}

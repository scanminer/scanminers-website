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
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-gradient-to-r from-primary via-accent to-secondary pointer-events-none" />

      <header className="sticky top-1 z-40 border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          {/* Logo with enhanced styling */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
              Scanminers
            </span>
          </Link>

          {/* Main Navigation - Desktop */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link
              href="/about"
              className="group relative text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              About
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/technologies"
              className="group relative text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              Technologies
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/insights"
              className="group relative text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              Insights
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/case-studies"
              className="group relative text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              Case Studies
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/contact"
              className="group relative text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              Contact
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
          </div>

          {/* Right side: CTAs + Utilities */}
          <div className="flex items-center gap-3">
            <Link
              href="/prospectivity-brief"
              className="hidden rounded-lg border-2 border-border bg-background px-4 py-2 text-xs font-semibold transition-all hover:border-primary hover:bg-card sm:inline-flex"
            >
              Free Brief
            </Link>
            <Link
              href="/consultation"
              className="hidden rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-fg shadow-md transition-all hover:bg-primary/90 hover:shadow-lg sm:inline-flex"
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

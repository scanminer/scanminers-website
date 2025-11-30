"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "@/components/Search";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileMenu, MobileMenuButton } from "@/components/mobile-menu";
import { Logo } from "@/components/logo";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Slim accent line with gradient */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-gradient-to-r from-brand-blue-deep via-brand-orange-terrain to-brand-green-mineral pointer-events-none" />

      <header className="sticky top-1 z-40 border-b border-border/40 bg-background/95 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Logo withWordmark />

          {/* Main Navigation - Desktop */}
          <div className="hidden items-center gap-6 lg:flex">
            <Link
              href="/solutions"
              className="group relative text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              Solutions
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/how-it-works"
              className="group relative text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              How It Works
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
              href="/insights"
              className="group relative text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              Insights
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/about"
              className="group relative text-sm font-semibold text-muted transition-colors hover:text-primary"
            >
              About
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
              className="hidden rounded-xl bg-[rgb(var(--sm-primary))] px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg transition-all hover:shadow-xl hover:-translate-y-[1px] sm:inline-flex"
            >
              Request a Scan
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

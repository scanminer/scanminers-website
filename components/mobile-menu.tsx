"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const initial = useRef(true);

  // Close menu on route change
  useEffect(() => {
    // Skip initial mount to avoid immediately closing after opening
    if (initial.current) {
      initial.current = false;
      return;
    }
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/technologies", label: "Technologies" },
    { href: "/insights", label: "Insights" },
    { href: "/case-studies", label: "Case Studies" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm animate-in slide-in-from-right duration-300"
      >
        <div className="flex h-full flex-col gap-6 bg-background p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={onClose}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight">
                Scanminers
              </span>
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-fg/70 transition-colors hover:bg-fg/10 hover:text-fg"
              aria-label="Close menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    group flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary"
                        : "text-fg/70 hover:bg-fg/5 hover:text-fg"
                    }
                  `}
                >
                  {link.label}
                  <svg
                    className={`h-5 w-5 transition-transform ${
                      isActive ? "translate-x-1" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/prospectivity-brief"
              className="rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-3 text-center text-sm font-bold text-primary transition-all hover:border-primary/50 hover:from-primary/10 hover:to-primary/15"
            >
              Request Free Brief
            </Link>
            <Link
              href="/consultation"
              className="rounded-xl bg-gradient-to-r from-secondary to-accent px-5 py-3 text-center text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Book Paid Consultation
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-auto space-y-3 border-t border-border/50 pt-6">
            <p className="text-xs font-semibold text-fg/50">
              AI-Powered Critical Minerals Prospectivity
            </p>
            <div className="flex items-center gap-4 text-xs text-fg/40">
              <Link href="/legal/privacy" className="hover:text-fg/60">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/legal/terms" className="hover:text-fg/60">
                Terms
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-fg/60">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-fg/70 transition-colors hover:bg-fg/10 hover:text-fg lg:hidden"
      aria-label="Open menu"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}

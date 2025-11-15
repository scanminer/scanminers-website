"use client";

import { useEffect } from "react";
import Link from "next/link";

export function CTAModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-bg p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold">Quick start</h3>
            <button onClick={onClose} className="rounded-lg p-2 text-fg/60 hover:bg-fg/10 hover:text-fg" aria-label="Close">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-fg/70">Choose the fastest path to value for your team.</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link href="/prospectivity-brief" className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 hover:border-primary/50">
              <p className="text-sm font-bold text-fg">Request prospectivity brief</p>
              <p className="mt-1 text-xs text-fg/70">Free assessment in 2–3 business days</p>
            </Link>
            <Link href="/consultation" className="rounded-xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 p-4 hover:border-secondary/50">
              <p className="text-sm font-bold text-fg">Book paid consultation</p>
              <p className="mt-1 text-xs text-fg/70">60-minute session with our team</p>
            </Link>
          </div>

          <div className="mt-5 text-xs text-fg/60">Have an AOI ready? Mention your regions, minerals, and any available data.</div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-72 rounded-2xl border border-border bg-bg p-4 shadow-xl">
          <div className="flex items-start justify-between">
            <p className="text-sm font-bold">Ask about your AOI</p>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-fg/60 hover:bg-fg/10 hover:text-fg" aria-label="Close">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-xs text-fg/70">Share your region, minerals and available data. We&apos;ll suggest the fastest path.</p>
          <div className="mt-3 flex items-center gap-2">
            <Link href="/prospectivity-brief" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-fg">Free brief</Link>
            <Link href="/consultation" className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-fg/5">Consultation</Link>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-gradient-to-r from-primary to-secondary p-4 text-white shadow-lg hover:shadow-xl"
        aria-label="Open chat"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}

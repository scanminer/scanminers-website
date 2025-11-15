"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CTAModal } from "@/components/cta-modal";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = (scrolled / docHeight) * 100;
      setVisible(percent > 20); // show after 20% scroll
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-4 z-40 px-4 transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-bg/95 p-3 shadow-[var(--shadow-soft)] backdrop-blur supports-[backdrop-filter]:bg-bg/80">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm font-semibold text-fg/80">Ready to screen your region? Get your free prospectivity brief.</p>
            <div className="flex items-center gap-2">
              <Link
                href="/prospectivity-brief"
                className="rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-bold text-white shadow-md hover:shadow-lg"
              >
                Request brief
              </Link>
              <button
                onClick={() => setOpen(true)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-fg/5"
              >
                More options
              </button>
            </div>
          </div>
        </div>
      </div>
      <CTAModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

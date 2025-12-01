"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AIInsightConsole } from "./ai-insight-console";

export function HeroCinematic() {
  return (
    <section className="relative overflow-hidden bg-[rgb(var(--sm-bg))]">
      {/* Background gradient + subtle patterns */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-slate-900/80" />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[rgb(var(--sm-primary)/0.05)] rounded-full blur-[120px]" />
        {/* Subtle scan lines */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 211, 238, 0.03) 2px, rgba(34, 211, 238, 0.03) 4px)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          {/* Left: Messaging */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--sm-surface-elevated))] px-4 py-2 border border-[rgba(var(--sm-border-subtle)/0.35)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--sm-primary))] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--sm-primary))]">
                AI Mineral Intelligence
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-[rgb(var(--sm-text))]">
              See Critical Mineral Targets{" "}
              <span className="text-[rgb(var(--sm-primary))]">
                Before the Drill Turns
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[rgb(var(--sm-text-muted))] leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Fuse satellite data, geoscience, and explainable AI reasoning to
              deliver ranked exploration targets in weeks—not quarters.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild variant="sm-primary" size="lg">
                <Link href="/prospectivity-brief">Request a Scan</Link>
              </Button>
              <Button asChild variant="sm-secondary" size="lg">
                <Link href="/case-studies">View Case Studies</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start items-center pt-4 text-sm text-[rgb(var(--sm-text-muted))]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-green-mineral animate-pulse" />
                <span>Validated by leading geologists</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[rgb(var(--sm-primary))] animate-pulse" />
                <span>Trusted by exploration teams</span>
              </div>
            </div>
          </div>

          {/* Right: AI Insight Console */}
          <div className="flex-1 flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-lg">
              <AIInsightConsole />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

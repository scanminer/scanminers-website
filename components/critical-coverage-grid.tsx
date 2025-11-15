"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/date";
import { trackEvent } from "@/lib/analytics";
import type { CriticalCoverageRow, CommodityStatus } from "@/lib/critical-coverage";

type Props = {
  rows: CriticalCoverageRow[];
};

type CTAIntent = "content" | "brief" | "consultation";

type CTAConfig = {
  maturity: CommodityStatus;
  primary: { label: string; href: string; intent: CTAIntent };
  secondary?: { label: string; href: string; intent: CTAIntent };
};
const CTA_ROUTES = {
  brief: "/prospectivity-brief",
  consultation: "/consultation",
};

const getCtaConfig = (row: CriticalCoverageRow): CTAConfig => {
  const tokenizedLabel = row.label.split(" ")[0];
  const commodityParam = encodeURIComponent(row.key);
  const defaultInsightsUrl = `/insights?commodity=${commodityParam}`;
  const briefUrl = `${CTA_ROUTES.brief}?commodity=${commodityParam}`;
  const consultationUrl = `${CTA_ROUTES.consultation}?commodity=${commodityParam}`;

  switch (row.maturity) {
    case "mature":
      return {
        maturity: row.maturity,
        primary: {
          label: `View ${row.label} work`,
          href: row.latestDoc?.url ?? "/case-studies",
          intent: "content",
        },
        secondary: {
          label: `Request a ${tokenizedLabel} prospectivity brief`,
          href: briefUrl,
          intent: "brief",
        },
      };
    case "emerging":
      return {
        maturity: row.maturity,
        primary: {
          label: "See what we're mapping",
          href: row.latestDoc?.url ?? defaultInsightsUrl,
          intent: "content",
        },
        secondary: {
          label: `Share your ${tokenizedLabel} AOI`,
          href: briefUrl,
          intent: "brief",
        },
      };
    case "scouting":
    default:
      return {
        maturity: row.maturity,
        primary: {
          label: "Tell us about your AOI",
          href: briefUrl,
          intent: "brief",
        },
        secondary: {
          label: "Book a 60-minute consultation",
          href: consultationUrl,
          intent: "consultation",
        },
      };
  }
};

const statusPillClass: Record<CommodityStatus, string> = {
  mature: "bg-emerald-500/15 text-emerald-400",
  emerging: "bg-sky-500/15 text-sky-400",
  scouting: "bg-amber-500/15 text-amber-400",
};

export function CriticalCoverageGrid({ rows }: Props) {
  const emitGridEvent = (row: CriticalCoverageRow, intent: CTAIntent, target: string) => () => {
    trackEvent("cta.grid_commodity_click", {
      commodity: row.key,
      label: row.label,
      maturity: row.maturity,
      status: row.status,
      intent,
      target,
      docs: row.docsCount,
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {rows.map((row) => {
        const regionDisplay =
          row.coverage.length > 0
            ? `${row.coverage.slice(0, 2).join(" • ")}${row.coverage.length > 2 ? ` +${row.coverage.length - 2}` : ""}`
            : row.defaultRegion ?? "—";
        const assetsDisplay =
          row.docsCount > 0 && row.docTypes.length > 0
            ? `${row.docsCount} · ${row.docTypes.join(" + ")}`
            : row.docsCount > 0
              ? `${row.docsCount} assets`
              : "Queued (accepting AOIs)";
        const cta = getCtaConfig(row);
        const latestDoc = row.latestDoc;

        return (
          <article key={row.key} className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Critical mineral</p>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">{row.label}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPillClass[row.maturity]}`}>{row.status}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{row.summary}</p>
            <dl className="mt-5 space-y-3 text-sm text-muted-foreground">
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-muted">Regions & belts</dt>
                <dd>{regionDisplay}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-muted">Sensors & workflows</dt>
                <dd>{row.sensors}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-muted">Assets in library</dt>
                <dd>{assetsDisplay}</dd>
              </div>
            </dl>
            {latestDoc ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Latest asset</p>
                  <p className="text-sm font-medium text-foreground">{latestDoc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {latestDoc.type} · {formatDate(latestDoc.publishedAt)}
                  </p>
                </div>
                <Link
                  href={latestDoc.url}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  onClick={emitGridEvent(row, "content", "latest-doc")}
                >
                  Open
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                <p>Scoping underway. Share your AOI to prioritize this mineral.</p>
                <Link
                  href={`${CTA_ROUTES.brief}?commodity=${encodeURIComponent(row.key)}`}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  onClick={emitGridEvent(row, "brief", "scouting-panel")}
                >
                  Submit AOI
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={cta.primary.href}
                className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
                onClick={emitGridEvent(row, cta.primary.intent, "primary-cta")}
              >
                {cta.primary.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              {cta.secondary && (
                <Link
                  href={cta.secondary.href}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold"
                  onClick={emitGridEvent(row, cta.secondary.intent, "secondary-cta")}
                >
                  {cta.secondary.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

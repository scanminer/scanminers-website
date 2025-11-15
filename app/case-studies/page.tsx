import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, MapPin, Rss } from "lucide-react";
import { absoluteUrl } from "@/lib/url";
import type { CaseStudy } from "contentlayer/generated";
import { allCaseStudies } from "contentlayer/generated";
import { slugifyTag } from "@/lib/slug";
import { formatDate } from "@/lib/date";

const toCommodityList = (study: CaseStudy): string[] => {
  const doc = study as CaseStudy & { commodities?: string[]; commodity?: string | string[] };
  if (Array.isArray(doc.commodities)) return doc.commodities;
  if (Array.isArray(doc.commodity)) return doc.commodity as string[];
  if (typeof doc.commodity === "string") return [doc.commodity];
  return [];
};

export const metadata: Metadata = {
  title: "Case Studies | Scanminers",
  description: "Real-world applications and outcomes of Scanminers' geospatial analytics.",
  alternates: { canonical: absoluteUrl("/case-studies") },
  openGraph: {
    title: "Case Studies | Scanminers",
    description: "Real-world applications and outcomes of Scanminers' geospatial analytics.",
    url: absoluteUrl("/case-studies"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Case Studies | Scanminers",
    description: "Real-world applications and outcomes of Scanminers' geospatial analytics.",
  },
};

export default function CaseStudiesIndexPage() {
  const studies = allCaseStudies
    .slice()
    .sort((a: CaseStudy, b: CaseStudy) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const tagSet = new Set<string>();
  const regionSet = new Set<string>();
  const commoditySet = new Set<string>();

  for (const study of studies) {
    if (Array.isArray(study.tags)) {
      for (const t of study.tags) tagSet.add(t);
    }
    if (study.region) regionSet.add(study.region);
    const commodities = toCommodityList(study);
    for (const c of commodities) commoditySet.add(c);
  }

  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  const metrics = [
    { label: "Published programs", value: studies.length.toString(), hint: "Complete AOI debriefs" },
    { label: "Regions mapped", value: regionSet.size.toString(), hint: "Across belts + basins" },
    { label: "Critical minerals", value: commoditySet.size.toString(), hint: "Tracked per mandate" },
  ];

  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/40 px-6 py-10 text-white shadow-[0_40px_120px_rgba(2,6,23,0.35)] sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="space-y-5 max-w-3xl">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/70">Operating proof</p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Field deployments that turned remote sensing into drill-ready confidence
              </h1>
              <p className="text-base text-white/80 sm:text-lg">
                Each case study unpacks the ingest pipeline, AI fusion, explainability artifacts, and the operational outcomes—so geology leads and
                CFOs can see exactly how Scanminers trims time-to-discovery.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:-translate-y-0.5">
                  Book a program review
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/case-studies/rss.xml" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10">
                  <Rss className="h-4 w-4" />
                  Subscribe via RSS
                </Link>
              </div>
            </div>
            <div className="flex flex-1 min-w-[220px] max-w-sm flex-col gap-4 rounded-2xl border border-white/15 bg-white/5 p-5">
              {metrics.map((metric) => (
                <div key={metric.label} className="border-b border-white/10 pb-4 last:border-none last:pb-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">{metric.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{metric.value}</p>
                  <p className="text-sm text-white/70">{metric.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-card/50 px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Navigate by theme</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Tags anchored to commodity mandates</h2>
            </div>
            <Link href="/case-studies/tags" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              View tag index
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {tags.length === 0 ? (
            <p className="mt-6 text-muted-foreground">Tags will appear once a case study is published.</p>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t}
                  href={`/case-studies/tags/${slugifyTag(t)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {t}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Field briefs</p>
              <h2 className="text-3xl font-semibold tracking-tight">Latest deployments</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Includes ingest stack, explainability snapshots, and KPIs per geography.
            </p>
          </div>
          {studies.length === 0 ? (
            <p className="text-muted-foreground">No case studies yet—new wins will appear here first.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {studies.map((study) => {
                const commodities = toCommodityList(study);
                return (
                  <article key={study._id} className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/60 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted">
                      <span>Case study</span>
                      <span className="text-muted">•</span>
                      {formatDate(study.publishedAt)}
                    </div>
                    <Link href={study.url} className="group mt-3 block">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground transition group-hover:text-primary">
                        {study.title}
                      </h3>
                    </Link>
                    {study.summary && <p className="mt-3 text-sm text-muted-foreground">{study.summary}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
                      {study.region && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {study.region}
                        </span>
                      )}
                      {commodities.length > 0 && (
                        <span className="inline-flex items-center gap-2">
                          <span className="text-muted">•</span>
                          {commodities.join(", ")}
                        </span>
                      )}
                    </div>
                    {Array.isArray(study.tags) && study.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        {study.tags.map((tag) => (
                          <Link key={tag} href={`/case-studies/tags/${slugifyTag(tag)}`} className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto pt-6">
                      <Link href={study.url} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Read deployment recap
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

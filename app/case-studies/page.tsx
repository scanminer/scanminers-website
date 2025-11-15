import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, MapPin, Rss } from "lucide-react";
import { absoluteUrl } from "@/lib/url";
import type { CaseStudy } from "contentlayer/generated";
import { allCaseStudies } from "contentlayer/generated";
import { slugifyTag } from "@/lib/slug";
import { formatDate } from "@/lib/date";
import { filterVisibleContent } from "@/lib/content-filters";

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
  // Filter to only show published or scheduled-past content
  const studies = filterVisibleContent(allCaseStudies as Array<CaseStudy & { status?: string; publishAt?: string }>)
    .slice()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
    <main className="min-h-screen bg-background px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-10 shadow-2xl sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="space-y-5 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Operating Proof
              </div>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Field deployments that turned remote sensing into <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">drill-ready confidence</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
                Each case study unpacks the <strong className="text-fg">ingest pipeline, AI fusion, explainability artifacts</strong>, and the operational outcomes—so geology leads and
                CFOs can see exactly how Scanminers <strong className="text-fg">trims time-to-discovery</strong>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl">
                  Book a program review
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/case-studies/rss.xml" className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-primary/5 px-5 py-3 text-sm font-bold text-primary transition hover:border-primary/50 hover:bg-primary/10">
                  <Rss className="h-4 w-4" />
                  Subscribe via RSS
                </Link>
              </div>
            </div>
            <div className="flex flex-1 min-w-[220px] max-w-sm flex-col gap-4 rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-6 shadow-inner">
              {metrics.map((metric, idx) => (
                <div key={metric.label} className="border-b border-border/40 pb-4 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{metric.label}</p>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-xs font-bold text-success">
                      {idx + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-gradient-to-br from-card via-card/50 to-background px-6 py-8 shadow-lg sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
                Navigate by Theme
              </div>
              <h2 className="mt-2 text-2xl font-bold text-foreground">Tags anchored to <span className="text-secondary">commodity mandates</span></h2>
            </div>
            <Link href="/case-studies/tags" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
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
                  className="inline-flex items-center gap-2 rounded-full border-2 border-border/70 bg-card/60 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-primary hover:shadow-lg"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {t}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Field Briefs
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Latest <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">deployments</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Includes <strong className="text-fg">ingest stack, explainability snapshots</strong>, and KPIs per geography.
            </p>
          </div>
          {studies.length === 0 ? (
            <p className="text-muted-foreground">No case studies yet—new wins will appear here first.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {studies.map((study) => {
                const commodities = toCommodityList(study);
                return (
                  <article key={study._id} className="group relative flex h-full flex-col rounded-2xl border border-border/70 bg-gradient-to-br from-card/60 via-card/40 to-background p-6 shadow-lg transition hover:border-primary/50 hover:shadow-2xl">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted">
                      <span className="font-semibold">Case study</span>
                      <span className="text-muted">•</span>
                      {formatDate(study.publishedAt)}
                    </div>
                    <Link href={study.url} className="mt-3 block">
                      <h3 className="text-2xl font-bold tracking-tight text-foreground transition group-hover:text-primary">
                        {study.title}
                      </h3>
                    </Link>
                    {study.summary && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{study.summary}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {study.region && (
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <MapPin className="h-4 w-4 text-primary" />
                          {study.region}
                        </span>
                      )}
                      {commodities.length > 0 && (
                        <span className="inline-flex items-center gap-2">
                          <span className="text-muted">•</span>
                          <strong className="text-fg">{commodities.join(", ")}</strong>
                        </span>
                      )}
                    </div>
                    {Array.isArray(study.tags) && study.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        {study.tags.map((tag) => (
                          <Link key={tag} href={`/case-studies/tags/${slugifyTag(tag)}`} className="rounded-full border border-border/70 bg-muted/60 px-3 py-1 font-semibold text-muted-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary">
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto pt-6">
                      <Link href={study.url} className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:underline">
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

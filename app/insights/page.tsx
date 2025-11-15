import Link from "next/link";
import type { Insight } from "contentlayer/generated";
import { allInsights } from "contentlayer/generated";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/url";
import { slugifyTag } from "@/lib/slug";
import { formatDate } from "@/lib/date";
import { ArrowUpRight, BookOpen, Clock3, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Insights | Scanminers",
  description: "Research, updates, and analyses from the Scanminers team.",
  alternates: { canonical: absoluteUrl("/insights") },
  openGraph: {
    title: "Insights | Scanminers",
    description: "Research, updates, and analyses from the Scanminers team.",
    url: absoluteUrl("/insights"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights | Scanminers",
    description: "Research, updates, and analyses from the Scanminers team.",
  },
};

const toCommodityList = (post: Insight): string[] => {
  const doc = post as Insight & { commodities?: string[]; commodity?: string | string[] };
  if (Array.isArray(doc.commodities)) return doc.commodities;
  if (Array.isArray(doc.commodity)) return doc.commodity as string[];
  if (typeof doc.commodity === "string") return [doc.commodity];
  return [];
};

export default function InsightsIndexPage() {
  const posts = allInsights
    .slice()
    .sort((a: Insight, b: Insight) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const tagSet = new Set<string>();
  const commoditySet = new Set<string>();
  let readingTotal = 0;

  for (const p of posts) {
    if (Array.isArray(p.tags)) {
      for (const t of p.tags) tagSet.add(t);
    }
    for (const c of toCommodityList(p)) commoditySet.add(c);
    readingTotal += typeof (p as Insight & { readingTimeMinutes?: number }).readingTimeMinutes === "number"
      ? (p as Insight & { readingTimeMinutes?: number }).readingTimeMinutes!
      : 0;
  }

  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  const avgReading = posts.length === 0 ? 0 : Math.max(1, Math.round(readingTotal / posts.length));

  const metrics = [
    { label: "Published research", value: posts.length.toString(), hint: "Briefings + workflows" },
    { label: "Avg. reading time", value: `${avgReading} min`, hint: "Per insight" },
    { label: "Critical minerals", value: commoditySet.size.toString(), hint: "Covered this quarter" },
  ];

  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/30 px-6 py-10 text-white sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-3xl space-y-5">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/70">Scanminers research feed</p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Critical minerals intelligence, supply-chain risk signals, and SAR/LiDAR workflows
              </h1>
              <p className="text-base text-white/80 sm:text-lg">
                Every note is written for technical buyers—remote sensing leads, geology managers, and operations chiefs who need pragmatic guidance
                on prospectivity modeling, ESG oversight, and admin-ready storytelling.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/insights/rss.xml" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-900">
                  <BookOpen className="h-4 w-4" />
                  Follow the RSS feed
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/10">
                  Pitch an insight
                  <ArrowUpRight className="h-4 w-4" />
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

        <section className="rounded-3xl border bg-card/40 px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Filter the feed</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">Tags mirror investor and geology mandates</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Save the tag URLs for investor updates or Decap CMS quick links; each route persists search context for editors.
            </p>
          </div>
          {tags.length === 0 ? (
            <p className="mt-6 text-muted-foreground">Tags will appear as soon as the first insight ships.</p>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t}
                  href={`/insights/tags/${slugifyTag(t)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-1 text-sm text-muted-foreground hover:text-primary"
                >
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  {t}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-muted">Latest notes</p>
              <h2 className="text-3xl font-semibold tracking-tight">Research, workflows, and governance updates</h2>
            </div>
            <p className="text-sm text-muted-foreground">Subscribe for new posts or drop a brief to queue the next topic.</p>
          </div>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">No insights yet—fresh research will land here.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {posts.map((post) => {
                const commodities = toCommodityList(post);
                const readingTime = (post as Insight & { readingTimeMinutes?: number }).readingTimeMinutes;
                return (
                  <article key={post._id} className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card/60 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted">
                      Research note · {formatDate(post.publishedAt)}
                    </div>
                    <Link href={post.url} className="mt-3 block">
                      <h3 className="text-xl font-semibold tracking-tight text-foreground transition group-hover:text-primary">{post.title}</h3>
                    </Link>
                    {post.summary && <p className="mt-2 text-sm text-muted-foreground">{post.summary}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {post.region && (
                        <span className="inline-flex items-center gap-1">
                          <ArrowUpRight className="h-3.5 w-3.5 rotate-45" />
                          {post.region}
                        </span>
                      )}
                      {commodities.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          · {commodities.join(", ")}
                        </span>
                      )}
                      {typeof readingTime === "number" && readingTime > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {readingTime} min
                        </span>
                      )}
                    </div>
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        {post.tags.map((tag) => (
                          <Link key={tag} href={`/insights/tags/${slugifyTag(tag)}`} className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto pt-6">
                      <Link href={post.url} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Read insight
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

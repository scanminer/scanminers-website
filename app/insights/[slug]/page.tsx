import Link from "next/link";
import Image from "next/image";
import type { Insight } from "contentlayer/generated";
import { allInsights } from "contentlayer/generated";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import { MDXContentServer } from "@/components/mdx-content-server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock3, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

type InsightWithMeta = Insight & {
  commodities?: string[];
  commodity?: string | string[];
  readingTimeMinutes?: number;
};

const getCommodities = (post: InsightWithMeta): string[] => {
  if (Array.isArray(post.commodities)) return post.commodities;
  if (Array.isArray(post.commodity)) return post.commodity as string[];
  if (typeof post.commodity === "string") return [post.commodity];
  return [];
};

export function generateStaticParams() {
  return allInsights.map((post) => ({ slug: post.slug }));
}

export default async function InsightPage({ params }: PageProps) {
  const { slug } = await params;
  const post = allInsights.find((p) => p.slug === slug) as
    | InsightWithMeta
    | undefined;

  if (!post) return notFound();

  const commodities = getCommodities(post);
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const readingTime =
    typeof post.readingTimeMinutes === "number"
      ? post.readingTimeMinutes
      : undefined;

  return (
    <main className="min-h-screen bg-[rgb(var(--sm-bg))] px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/insights"
          className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--sm-text-muted))] transition hover:text-[rgb(var(--sm-primary))]"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          Back to Insights
        </Link>

        <article className="space-y-10">
          {post.image && (
            <div className="relative overflow-hidden rounded-3xl border border-[rgba(var(--sm-border-subtle)/0.7)] shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
              <Image
                src={post.image}
                alt={post.imageAlt || post.title}
                width={1600}
                height={900}
                className="h-full w-full object-cover"
                priority
                placeholder={post.imageBlurDataURL ? "blur" : undefined}
                blurDataURL={post.imageBlurDataURL}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,6,23,0.85)] via-transparent to-transparent" />
            </div>
          )}

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--sm-primary)/0.12)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--sm-primary))]">
              Insight
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[rgb(var(--sm-text))] sm:text-5xl">
              {post.title}
            </h1>
            {post.summary && (
              <p className="text-lg leading-relaxed text-[rgb(var(--sm-text-muted))]">
                {post.summary}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[rgb(var(--sm-text-muted))]">
              <div className="inline-flex items-center gap-2 font-semibold text-[rgb(var(--sm-text))]">
                <Calendar className="h-4 w-4 text-[rgb(var(--sm-primary))]" />
                <time>{formatDate(post.publishedAt)}</time>
              </div>
              {post.region && (
                <>
                  <span>•</span>
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[rgb(var(--sm-primary))]" />
                    <span className="font-semibold text-[rgb(var(--sm-text))]">
                      {post.region}
                    </span>
                  </div>
                </>
              )}
              {commodities.length > 0 && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-[rgb(var(--sm-text))]">
                    {commodities.join(", ")}
                  </span>
                </>
              )}
              {typeof readingTime === "number" && readingTime > 0 && (
                <>
                  <span>•</span>
                  <div className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-[rgb(var(--sm-primary))]" />
                    <span className="font-semibold text-[rgb(var(--sm-text))]">
                      {readingTime} min read
                    </span>
                  </div>
                </>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="border-[rgba(var(--sm-border-subtle)/0.8)] text-[rgb(var(--sm-text-muted))]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-lg max-w-none prose-headings:text-[rgb(var(--sm-text))] prose-headings:font-semibold prose-p:text-[rgb(var(--sm-text-muted))] prose-strong:text-[rgb(var(--sm-text))] prose-a:text-[rgb(var(--sm-primary))] prose-a:font-semibold prose-img:rounded-2xl prose-img:border prose-img:border-[rgba(var(--sm-border-subtle)/0.8)] dark:prose-invert">
            <MDXContentServer code={post.body.code} />
          </div>

          {Array.isArray(post.citations) && post.citations.length > 0 && (
            <section className="rounded-2xl border border-[rgba(var(--sm-border-subtle)/0.8)] bg-[rgba(var(--sm-surface)/0.65)] p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-[rgb(var(--sm-text))]">
                References
              </h2>
              <ol className="list-decimal space-y-3 pl-5 text-[rgb(var(--sm-text-muted))]">
                {post.citations.map((citation, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {citation}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="rounded-2xl border border-[rgba(var(--sm-border-subtle)/0.8)] bg-[rgba(var(--sm-surface)/0.85)] p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[rgb(var(--sm-text))]">
              Want to apply this on your ground?
            </h2>
            <p className="mt-3 leading-relaxed text-[rgb(var(--sm-text-muted))]">
              Share your area of interest, commodity and stage of exploration.
              We&apos;ll outline what a Scanminers remote sensing and AI study
              could look like for your team.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="sm-primary" size="lg">
                <Link href="/contact">Request a Scan</Link>
              </Button>
              <Button asChild variant="sm-secondary" size="lg">
                <Link href="/solutions">View our solutions</Link>
              </Button>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}

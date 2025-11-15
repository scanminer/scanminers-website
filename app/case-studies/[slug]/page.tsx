import Link from "next/link";
import Image from "next/image";
import type { CaseStudy } from "contentlayer/generated";
import { allCaseStudies } from "contentlayer/generated";
import { MDXContentServer } from "@/components/mdx-content-server";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return allCaseStudies.map((study) => ({
    slug: study.slug,
  }));
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = allCaseStudies.find((s: CaseStudy) => s.slug === slug) as CaseStudy | undefined;
  if (!study) return notFound();

  // Extract commodities
  const doc = study as CaseStudy & { commodities?: string[]; commodity?: string | string[] };
  let commodities: string[] = [];
  if (Array.isArray(doc.commodities)) commodities = doc.commodities;
  else if (Array.isArray(doc.commodity)) commodities = doc.commodity as string[];
  else if (typeof doc.commodity === "string") commodities = [doc.commodity];

  return (
    <div className="min-h-screen bg-background px-6 py-12 sm:px-10">
      <main className="mx-auto max-w-4xl">
        <Link 
          href="/case-studies" 
          className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          Back to Case Studies
        </Link>

        <article>
          {/* Hero Image */}
          {study.image && (
            <div className="mb-8 overflow-hidden rounded-2xl border-2 border-border/70 shadow-2xl">
              <Image
                src={study.image}
                alt={study.imageAlt || study.title}
                width={1200}
                height={630}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                className="w-full h-auto"
                placeholder={study.imageBlurDataURL ? "blur" : undefined}
                blurDataURL={study.imageBlurDataURL}
                priority
              />
            </div>
          )}

          {/* Header Section */}
          <header className="mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Case Study
            </div>
            
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {study.title}
            </h1>
            
            {study.summary && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {study.summary}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <time className="font-semibold">{formatDate(study.publishedAt)}</time>
              </div>
              
              {study.region && (
                <>
                  <span className="text-muted">•</span>
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{study.region}</span>
                  </div>
                </>
              )}
              
              {commodities.length > 0 && (
                <>
                  <span className="text-muted">•</span>
                  <div className="inline-flex items-center gap-2">
                    <span className="font-bold text-fg">{commodities.join(", ")}</span>
                  </div>
                </>
              )}
            </div>

            {/* Tags */}
            {Array.isArray(study.tags) && study.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {study.tags.map((tag: string) => (
                  <span 
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Main Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-strong:text-fg prose-strong:font-semibold
            prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            prose-ul:my-6 prose-li:text-muted-foreground
            prose-img:rounded-2xl prose-img:border-2 prose-img:border-border/70 prose-img:shadow-xl
          ">
            <MDXContentServer code={study.body.code} />
          </div>

          {/* Provenance Section */}
          {Array.isArray(study.provenance) && study.provenance.length > 0 && (
            <section className="mt-16 rounded-2xl border-2 border-earth/30 bg-gradient-to-br from-earth/10 via-earth/5 to-transparent p-8 shadow-inner">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-earth/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-earth">
                Provenance
              </div>
              <h2 className="text-2xl font-bold mb-6">Data Sources & Methodology</h2>
              <ol className="space-y-4">
                {study.provenance.map((p: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-earth/20 text-sm font-bold text-earth">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed pt-0.5">{p}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Citations Section */}
          {Array.isArray(study.citations) && study.citations.length > 0 && (
            <section className="mt-12 rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/50 to-background p-8 shadow-lg">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
                References
              </div>
              <h2 className="text-2xl font-bold mb-6">Scientific Citations</h2>
              <ol className="space-y-4">
                {study.citations.map((c: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">{c}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* CTA Section */}
          <section className="mt-16 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center shadow-xl">
            <h3 className="text-2xl font-bold mb-3">
              Interested in similar <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">prospectivity analysis</span>?
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Request a custom brief for your area of interest or schedule a consultation to discuss your exploration program.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/prospectivity-brief"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Request a Brief
              </Link>
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/5 px-6 py-3 text-sm font-bold text-primary transition hover:border-primary/50 hover:bg-primary/10"
              >
                Schedule Consultation
              </Link>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}

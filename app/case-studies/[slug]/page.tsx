import Link from "next/link";
import Image from "next/image";
import type { CaseStudy } from "contentlayer/generated";
import { allCaseStudies } from "contentlayer/generated";
import { MDXContentServer } from "@/components/mdx-content-server";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";

export const runtime = 'edge';
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = allCaseStudies.find((s: CaseStudy) => s.slug === slug) as CaseStudy | undefined;
  if (!study) return notFound();

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <Link href="/case-studies" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Case Studies
        </Link>

        <article>
          {study.image && (
            <Image
              src={study.image}
              alt={study.imageAlt || study.title}
              width={1200}
              height={630}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="w-full h-auto rounded-lg border border-black/10 dark:border-white/10 mb-6"
              placeholder={study.imageBlurDataURL ? "blur" : undefined}
              blurDataURL={study.imageBlurDataURL}
              priority
            />
          )}

          <h1 className="text-4xl font-bold mb-3">{study.title}</h1>
          <time className="text-sm text-gray-500">{formatDate(study.publishedAt)}</time>
          {study.summary && <p className="mt-3 text-gray-700">{study.summary}</p>}

          <div className="mdx mt-8">
            <MDXContentServer code={study.body.code} />
          </div>

          {Array.isArray(study.provenance) && study.provenance.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold mb-3">Provenance</h2>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                {study.provenance.map((p: string, idx: number) => (
                  <li key={idx}>{p}</li>
                ))}
              </ol>
            </section>
          )}

          {Array.isArray(study.citations) && study.citations.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold mb-3">References</h2>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                {study.citations.map((c: string, idx: number) => (
                  <li key={idx}>{c}</li>
                ))}
              </ol>
            </section>
          )}
        </article>
      </main>
    </div>
  );
}

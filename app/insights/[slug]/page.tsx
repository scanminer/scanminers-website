import Link from "next/link";
import Image from "next/image";
import type { Insight } from "contentlayer/generated";
import { allInsights } from "contentlayer/generated";
import { MDXContentServer } from "@/components/mdx-content-server";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export const runtime = 'edge';
export const dynamic = "force-dynamic";

export default async function InsightPage({ params }: PageProps) {
  const { slug } = await params;
  const post = allInsights.find((p: Insight) => p.slug === slug) as Insight | undefined;

  if (!post) {
    return notFound();
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <Link href="/insights" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Insights
        </Link>

  <article>
          {post.image && (
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              width={1200}
              height={630}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="w-full h-auto rounded-lg border border-black/10 dark:border-white/10 mb-6"
              placeholder={post.imageBlurDataURL ? "blur" : undefined}
              blurDataURL={post.imageBlurDataURL}
              priority
            />
          )}
          <h1 className="text-4xl font-bold mb-3">{post.title}</h1>
          <time className="text-sm text-gray-500">
            {formatDate(post.publishedAt)}
          </time>
          {post.summary && (
            <p className="mt-3 text-gray-700">{post.summary}</p>
          )}

          <div className="mdx mt-8">
            <MDXContentServer code={post.body.code} />
          </div>

          {Array.isArray(post.citations) && post.citations.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold mb-3">References</h2>
              <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                {post.citations.map((c: string, idx: number) => (
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

function formatDate(input: string | Date): string {
  const d = new Date(input);
  if (isNaN(d.getTime())) return '';
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

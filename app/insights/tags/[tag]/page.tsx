import Link from "next/link";
import type { Metadata } from "next";
import { allInsights } from "contentlayer/generated";
import type { Insight } from "contentlayer/generated";
import { absoluteUrl } from "@/lib/url";
import { slugifyTag } from "@/lib/slug";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: tagParam } = await params;
  const tag = tagParam;
  const title = `Insights tagged “${tag}” | Scanminers`;
  const description = `Articles and research tagged ${tag} by the Scanminers team.`;
  const url = absoluteUrl(`/insights/tags/${tagParam}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag: tagParam } = await params;
  const posts: Insight[] = allInsights
    .filter((p) => Array.isArray(p.tags) && p.tags.some((t) => slugifyTag(t) === tagParam))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (posts.length === 0) {
    // Unknown tag slug or no posts for this tag — surface a 404
    return notFound();
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tag: {tagParam}</h1>
        <Link href="/insights" className="text-blue-600 hover:underline mb-6 inline-block">← All insights</Link>
        <ul className="space-y-8">
          {posts.map((p: Insight) => (
            <li key={p._id} className="border-b pb-6">
              <Link href={p.url} className="group">
                <h2 className="text-2xl font-semibold group-hover:text-blue-600">{p.title}</h2>
              </Link>
              <time className="block text-sm text-gray-500 mt-1">
                {new Date(p.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {p.summary && <p className="mt-3 text-gray-700">{p.summary}</p>}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

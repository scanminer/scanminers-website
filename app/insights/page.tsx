import Link from "next/link";
// importing type from path configured in tsconfig; will be available after contentlayer generates
import type { Insight } from "contentlayer/generated";
import { allInsights } from "contentlayer/generated";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/url";
import { slugifyTag } from "@/lib/slug";

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

export default function InsightsIndexPage() {
  const posts = allInsights
    .slice()
    .sort((a: Insight, b: Insight) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const tagSet = new Set<string>();
  for (const p of posts) {
    if (Array.isArray(p.tags)) {
      for (const t of p.tags) tagSet.add(t);
    }
  }
  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Insights</h1>
        {tags.length > 0 && (
          <div className="mb-8">
            <div className="text-sm text-gray-500 mb-2">Browse by tag:</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t}
                  href={`/insights/tags/${slugifyTag(t)}`}
                  className="px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-gray-600">No insights yet.</p>
        ) : (
          <ul className="space-y-8">
            {posts.map((p: Insight) => (
              <li key={p._id} className="border-b pb-6">
                <Link href={p.url} className="group">
                  <h2 className="text-2xl font-semibold group-hover:text-blue-600">
                    {p.title}
                  </h2>
                </Link>
                <time className="block text-sm text-gray-500 mt-1">
                  {new Date(p.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {p.summary && (
                  <p className="mt-3 text-gray-700">{p.summary}</p>
                )}
                {Array.isArray(p.tags) && p.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <Link
                        key={t}
                        href={`/insights/tags/${slugifyTag(t)}`}
                        className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-xs"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

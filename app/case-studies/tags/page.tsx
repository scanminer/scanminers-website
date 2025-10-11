import Link from "next/link";
import type { Metadata } from "next";
import { allCaseStudies } from "contentlayer/generated";
import { slugifyTag } from "@/lib/slug";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = {
  title: "Tags | Scanminers Case Studies",
  description: "Browse all tags used in Scanminers Case Studies.",
  alternates: { canonical: absoluteUrl("/case-studies/tags") },
  openGraph: {
    title: "Tags | Scanminers Case Studies",
    description: "Browse all tags used in Scanminers Case Studies.",
    url: absoluteUrl("/case-studies/tags"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tags | Scanminers Case Studies",
    description: "Browse all tags used in Scanminers Case Studies.",
  },
};

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function TagsIndexPage({ searchParams }: PageProps) {
  const sp = (await (searchParams ?? Promise.resolve({}))) as Record<string, string | string[] | undefined>;
  const sortParam = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const sort = sortParam === "count" ? "count" : "alpha"; // default alpha

  const counts = new Map<string, number>();
  for (const s of allCaseStudies as Array<{ tags?: string[] }>) {
    if (Array.isArray(s.tags)) {
      for (const t of s.tags) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
  }
  const items = Array.from(counts.entries()).map(([t, c]) => ({ tag: t, slug: slugifyTag(t), count: c }));
  items.sort((a, b) => {
    if (sort === "count") {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    }
    return a.tag.localeCompare(b.tag);
  });

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">All Tags</h1>
        <Link href="/case-studies" className="text-blue-600 hover:underline mb-6 inline-block">← Back to Case Studies</Link>

        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span>Sort:</span>
          <Link
            href={`/case-studies/tags${sort === "alpha" ? "" : "?sort=alpha"}`}
            className={`px-2 py-1 rounded ${sort === "alpha" ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
          >
            A → Z
          </Link>
          <Link
            href={`/case-studies/tags?sort=count`}
            className={`px-2 py-1 rounded ${sort === "count" ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
          >
            Most used
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-600">No tags found.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((it) => (
              <li key={it.slug}>
                <Link
                  href={`/case-studies/tags/${it.slug}`}
                  className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-between"
                >
                  <span>{it.tag}</span>
                  <span className="text-sm text-gray-500">{it.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

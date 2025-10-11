import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/url";
import type { CaseStudy } from "contentlayer/generated";
import { allCaseStudies } from "contentlayer/generated";
import { slugifyTag } from "@/lib/slug";

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
  for (const s of studies as Array<CaseStudy & { tags?: string[] }>) {
    if (Array.isArray(s.tags)) {
      for (const t of s.tags) tagSet.add(t);
    }
  }
  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Case Studies</h1>
        {tags.length > 0 && (
          <div className="mb-8">
            <div className="text-sm text-gray-500 mb-2">Browse by tag:</div>
            <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                <Link
                  key={t}
                      href={`/case-studies/tags/${slugifyTag(t)}`}
                  className="px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {studies.length === 0 ? (
          <p className="text-gray-600">No case studies yet.</p>
        ) : (
          <ul className="space-y-8">
            {studies.map((s: CaseStudy) => (
              <li key={s._id} className="border-b pb-6">
                <Link href={s.url} className="group">
                  <h2 className="text-2xl font-semibold group-hover:text-blue-600">{s.title}</h2>
                </Link>
                <time className="block text-sm text-gray-500 mt-1">
                  {new Date(s.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {s.summary && <p className="mt-3 text-gray-700">{s.summary}</p>}
                {Array.isArray((s as CaseStudy & { tags?: string[] }).tags) && (s as CaseStudy & { tags?: string[] }).tags!.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(s as CaseStudy & { tags?: string[] }).tags!.map((t: string) => (
                      <Link
                        key={t}
                            href={`/case-studies/tags/${slugifyTag(t)}`}
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

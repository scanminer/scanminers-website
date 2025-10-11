import Link from "next/link";
import type { Metadata } from "next";
import { allCaseStudies } from "contentlayer/generated";
import type { CaseStudy } from "contentlayer/generated";
import { absoluteUrl } from "@/lib/url";
import { slugifyTag } from "@/lib/slug";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  const tags = new Set<string>();
  for (const s of allCaseStudies as Array<CaseStudy & { tags?: string[] }>) {
    if (Array.isArray(s.tags)) {
      for (const t of s.tags) tags.add(t);
    }
  }
  return Array.from(tags).map((t) => ({ tag: slugifyTag(t) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: tagParam } = await params;
  const title = `Case Studies tagged “${tagParam}” | Scanminers`;
  const description = `Case studies tagged ${tagParam} by the Scanminers team.`;
  const url = absoluteUrl(`/case-studies/tags/${tagParam}`);
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
  const studies: CaseStudy[] = (allCaseStudies as Array<CaseStudy & { tags?: string[] }>)
    .filter((s) => Array.isArray(s.tags) && s.tags.some((t: string) => slugifyTag(t) === tagParam))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (studies.length === 0) return notFound();

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tag: {tagParam}</h1>
        <Link href="/case-studies" className="text-blue-600 hover:underline mb-6 inline-block">← All case studies</Link>
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
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

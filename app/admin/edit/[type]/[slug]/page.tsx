import Link from "next/link";
import { notFound } from "next/navigation";
import { allInsights, allCaseStudies, type Insight, type CaseStudy } from "contentlayer/generated";
import { MDXContent } from "@/components/mdx-content";
import { RegenerateCoverButton } from "@/components/RegenerateCoverButton";
import { ApproveButton } from "@/components/ApproveButton";
import { PublishButton } from "@/components/PublishButton";

export const dynamic = "force-dynamic";

type Props = { params: { type: string; slug: string } };

export default function AdminEditPage({ params }: Props) {
  const { type, slug } = params;
  const t = (type || "").toLowerCase();

  let doc: Insight | CaseStudy | null = null;
  if (t === "insight") {
    const d = allInsights.find((d) => d.slug === slug);
    if (d) doc = d;
  } else if (t === "case-study") {
    const d = allCaseStudies.find((d) => d.slug === slug);
    if (d) doc = d;
  }

  if (!doc) return notFound();

  const repo = process.env.GH_REPO || null;
  const previewUrl = t === "insight" ? `/insights/${doc.slug}` : t === "case-study" ? `/case-studies/${doc.slug}` : null;
  const editUrl = repo ? `https://github.com/${repo}/edit/main/${doc._raw?.sourceFilePath ?? ""}` : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">{t}</div>
          <h1 className="text-2xl font-semibold mt-1">{doc.title}</h1>
          {doc.summary ? (
            <p className="mt-2 text-[color:var(--muted-foreground)]">{doc.summary}</p>
          ) : null}
          <div className="mt-2 flex gap-3 text-sm">
            {previewUrl ? (
              <Link className="text-blue-600 hover:underline" href={previewUrl} target="_blank">
                View public page
              </Link>
            ) : null}
            {editUrl ? (
              <a className="text-blue-600 hover:underline" href={editUrl} target="_blank" rel="noreferrer">
                Edit on GitHub
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {doc.slug ? <RegenerateCoverButton slug={doc.slug} path={doc._raw?.sourceFilePath} /> : null}
          <ApproveButton slug={doc.slug} path={doc._raw?.sourceFilePath} />
          <PublishButton slug={doc.slug} path={doc._raw?.sourceFilePath} />
        </div>
      </div>

      {/* Cover image if provided */}
      {(doc.image || (doc as CaseStudy).coverImage) ? (
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(doc as CaseStudy).coverImage || doc.image!}
            alt={doc.imageAlt || "Cover image"}
            className="w-full rounded-md border border-black/10 dark:border-white/10"
          />
        </div>
      ) : null}

      {/* Render the MDX body */}
      {doc.body?.code ? (
        <article className="mdx">
          <MDXContent code={doc.body.code} />
        </article>
      ) : (
        <p className="text-[color:var(--muted-foreground)]">No MDX body to render.</p>
      )}
    </div>
  );
}

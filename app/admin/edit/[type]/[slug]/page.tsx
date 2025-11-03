import Link from "next/link";
import { notFound } from "next/navigation";
import { allInsights, allCaseStudies, type Insight, type CaseStudy } from "contentlayer/generated";
import { MDXContent } from "@/components/mdx-content";
import { RegenerateCoverButton } from "@/components/RegenerateCoverButton";
import { ApproveButton } from "@/components/ApproveButton";
import { PublishButton } from "@/components/PublishButton";
import { formatDate } from "@/lib/date";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type PageProps = { params: Promise<{ type: string; slug: string }> };

export default async function AdminEditPage({ params }: PageProps) {
  const { type, slug } = await params;
  const t = (type || "").toLowerCase();
  const isCaseStudy = t === "case-study";

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
  const galleryFirst = ((doc as Insight).images ?? (doc as CaseStudy).images ?? [])[0]?.src;
  const coverSrc =
    (isCaseStudy ? (doc as CaseStudy).coverImage : undefined) ||
    doc.image ||
    galleryFirst ||
    "/og-default.svg";
  type MediaItem = { src: string; alt: string; caption?: string; license?: string };
  const gallery: MediaItem[] = (doc as Insight).images ?? (doc as CaseStudy).images ?? [];
  const tags = (doc as Insight).tags ?? (doc as CaseStudy).tags ?? [];
  const citations = (doc as Insight).citations ?? (doc as CaseStudy).citations ?? [];
  const provenance = isCaseStudy ? (doc as CaseStudy).provenance ?? [] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-3 text-xs">
        <Link className="text-blue-600 hover:underline" href="/admin">← Back to Review Queue</Link>
      </div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">{t}</div>
          <h1 className="text-2xl font-semibold mt-1">{doc.title}</h1>
          {doc.summary ? (
            <p className="mt-2 text-[color:var(--muted-foreground)]">{doc.summary}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded border border-black/10 dark:border-white/10 px-2 py-0.5 text-[color:var(--muted-foreground)]">
              Published: {formatDate(doc.publishedAt)}
            </span>
            <span className="rounded border border-black/10 dark:border-white/10 px-2 py-0.5 text-[color:var(--muted-foreground)]">
              Status: {doc.review_status}
            </span>
            {doc.ai_generated ? (
              <span className="rounded border border-amber-400/60 bg-amber-50/40 px-2 py-0.5 text-amber-800">AI-generated</span>
            ) : null}
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
      {coverSrc ? (
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverSrc} alt={doc.imageAlt || "Cover image"} className="w-full rounded-md border border-black/10 dark:border-white/10" />
        </div>
      ) : null}

      {/* Meta sidebar */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-md border border-[color:var(--border-color)] p-3 text-sm md:col-span-2 bg-white">
          <div className="mb-2 font-medium">Details</div>
          {tags && tags.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded px-2 py-0.5 text-xs border border-[color:var(--chip-border)] bg-[color:var(--chip-bg)] text-[color:var(--chip-text)]">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[color:var(--muted-foreground)]">No tags</div>
          )}
          {citations && citations.length > 0 ? (
            <div className="mt-3">
              <div className="mb-1 text-xs font-medium">Citations</div>
              <ul className="list-disc pl-5 text-xs">
                {citations.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {provenance && provenance.length > 0 ? (
            <div className="mt-3">
              <div className="mb-1 text-xs font-medium">Provenance</div>
              <ul className="list-disc pl-5 text-xs">
                {provenance.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="rounded-md border border-[color:var(--border-color)] p-3 text-sm bg-white">
          <div className="mb-2 font-medium">Actions</div>
          <div className="space-y-2 text-xs text-[color:var(--muted-foreground)]">
            <div>
              Use the buttons above to regenerate the cover image (AI), approve content (opens PR), or publish now.
            </div>
            {previewUrl ? (
              <div>
                Public URL: <Link className="text-blue-600 hover:underline" href={previewUrl} target="_blank">open</Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Render the MDX body */}
      {doc.body?.code ? (
        <article className="mdx">
          <MDXContent code={doc.body.code} />
        </article>
      ) : (
        <p className="text-[color:var(--muted-foreground)]">No MDX body to render.</p>
      )}

      {/* Gallery */}
      {gallery && gallery.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-2 text-lg font-semibold">Image Gallery</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {gallery.map((img, i) => (
              <figure key={`${img.src}-${i}`} className="rounded-md border border-black/10 dark:border-white/10 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} className="w-full rounded" />
                {(img.caption || img.license) ? (
                  <figcaption className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                    {img.caption ? <span>{img.caption}</span> : null}
                    {img.caption && img.license ? <span> • </span> : null}
                    {img.license ? <span>License: {img.license}</span> : null}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

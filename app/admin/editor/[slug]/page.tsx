import { allInsights, allCaseStudies } from "contentlayer/generated";
import { EditorPortal } from "@/components/admin/editor/EditorPortal";
import type { ContentType } from "../actions";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ type?: string }>;
};

export default async function EditorPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Try to find the content in both Insights and Case Studies
  const insight = allInsights.find((i) => i.slug === slug);
  const caseStudy = allCaseStudies.find((cs) => cs.slug === slug);

  const content = insight || caseStudy;
  
  if (!content) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Content Not Found</h1>
          <p className="text-muted-foreground">
            The content with slug <code className="rounded bg-muted px-2 py-1 text-sm">{slug}</code> was not found.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            To create new content, use the{" "}
            <a href="/admin/drafts" className="font-semibold text-primary hover:underline">
              Drafts system
            </a>{" "}
            to generate initial MDX files via GitHub.
          </p>
        </div>
      </div>
    );
  }

  // Determine content type
  const contentType: ContentType = insight ? "insight" : "case-study";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Content Editor</h1>
          <p className="text-sm text-muted-foreground">
            {contentType === "insight" ? "Insight" : "Case Study"} · {slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View Live →
          </a>
        </div>
      </div>

      <EditorPortal content={content} contentType={contentType} />
    </div>
  );
}

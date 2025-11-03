import { AdminQueueClient } from "@/components/AdminQueueClient";
import { allInsights, allCaseStudies, allBriefs } from "contentlayer/generated";

type QueueItem = {
  type: "insight" | "case-study" | "brief";
  title: string;
  slug?: string | null;
  sourcePath?: string | null;
};

type DocLike = {
  title?: string;
  slug?: string;
  _raw?: { sourceFilePath?: string };
  review_status?: string | null;
};

function hasNeedsReview(d: DocLike): boolean {
  const v = (d.review_status ?? "").toString().toLowerCase();
  return v === "needs-review";
}

function getQueue(): QueueItem[] {
  const cast = (arr: unknown) => arr as DocLike[];

  const pendingInsights: QueueItem[] = cast(allInsights)
    .filter(hasNeedsReview)
    .map((d) => ({ type: "insight", title: d.title ?? "(untitled)", slug: d.slug ?? null, sourcePath: d._raw?.sourceFilePath ?? null }));

  const pendingCaseStudies: QueueItem[] = cast(allCaseStudies)
    .filter(hasNeedsReview)
    .map((d) => ({ type: "case-study", title: d.title ?? "(untitled)", slug: d.slug ?? null, sourcePath: d._raw?.sourceFilePath ?? null }));

  const pendingBriefs: QueueItem[] = cast(allBriefs)
    .filter(hasNeedsReview)
    .map((d) => ({ type: "brief", title: d.title ?? "(untitled)", slug: d.slug ?? null, sourcePath: d._raw?.sourceFilePath ?? null }));

  return [...pendingInsights, ...pendingCaseStudies, ...pendingBriefs];
}

// preview/edit helpers moved client-side within AdminQueueClient

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default function AdminReviewQueuePage() {
  const queue = getQueue();
  const repo = process.env.GH_REPO;

  return (
    <div>
      {/* Create New CTA */}
      <div className="mb-6 rounded-md border border-[color:var(--border-color)] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Create New</h2>
            <p className="text-sm text-[color:var(--muted-foreground)]">Start a new brief or article in the CMS.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/admin/index.html#/collections/briefs/new"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-md bg-black text-white text-sm"
            >
              New Brief (AI)
            </a>
            <a
              href="/admin/index.html#/collections/insights/new"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-md border border-[color:var(--border-color)] text-sm hover:bg-[color:var(--chip-bg)]"
            >
              New Insight
            </a>
            <a
              href="/admin/index.html#/collections/case_studies/new"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-md border border-[color:var(--border-color)] text-sm hover:bg-[color:var(--chip-bg)]"
            >
              New Case Study
            </a>
          </div>
        </div>
        <div className="mt-2 text-xs text-[color:var(--muted-foreground)]">
          CMS opens in a new tab. If it doesn’t load here, try the full CMS link:
          {" "}
          <a href="/admin/index.html" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">/admin/index.html</a>
        </div>
      </div>

      <h2 className="mb-4 text-xl font-medium">Review Queue</h2>
      {queue.length === 0 ? (
        <p className="text-sm text-gray-600">No items with review_status: &quot;needs-review&quot;.</p>
      ) : (
        <AdminQueueClient items={queue} repo={repo ?? null} />
      )}

      {!repo && (
        <p className="mt-4 text-xs text-amber-700">Tip: set GH_REPO in env (e.g. scanminer/scanminers-website) to enable &quot;Edit on GitHub&quot; links.</p>
      )}
    </div>
  );
}

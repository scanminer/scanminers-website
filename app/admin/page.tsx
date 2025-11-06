import Link from "next/link";
import { RegenerateCoverButton } from "@/components/RegenerateCoverButton";
import { allInsights, allCaseStudies, allBriefs } from "contentlayer/generated";
import { ApprovePublishButton } from "@/components/ApprovePublishButton";

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

function previewUrlFor(item: QueueItem): string | null {
  if (!item.slug) return null;
  switch (item.type) {
    case "insight":
      return `/insights/${item.slug}`;
    case "case-study":
      return `/case-studies/${item.slug}`;
    case "brief":
      return null; // Briefs may not have public pages
    default:
      return null;
  }
}

function editUrlFor(item: QueueItem): string | null {
  const repo = process.env.GH_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO;
  if (!repo || !item.sourcePath) return null;
  return `https://github.com/${repo}/edit/main/${item.sourcePath}`;
}

export const dynamic = "force-static";

export default function AdminReviewQueuePage() {
  const queue = getQueue();
  const repo = process.env.GH_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO;

  return (
    <div>
      <h2 className="mb-4 text-xl font-medium">Review Queue</h2>
      {queue.length === 0 ? (
        <p className="text-sm text-gray-600">No items with review_status: &quot;needs-review&quot;.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Type</th>
              <th className="py-2">Title</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item, idx) => {
              const preview = previewUrlFor(item);
              const edit = editUrlFor(item);
              return (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2 capitalize">{item.type.replace("-", " ")}</td>
                  <td className="py-2">{item.title}</td>
                  <td className="py-2 flex gap-3">
                    {preview ? (
                      <Link className="text-blue-600 hover:underline" href={preview} target="_blank">Preview</Link>
                    ) : (
                      <span className="text-gray-400">No preview</span>
                    )}
                    {edit ? (
                      <a className="text-blue-600 hover:underline" href={edit} target="_blank" rel="noreferrer">Edit on GitHub</a>
                    ) : (
                      <span className="text-gray-400">Set GH_REPO</span>
                    )}
                    {item.slug ? (
                      <ApprovePublishButton kind={item.type} slug={item.slug} />
                    ) : (
                      <span className="text-gray-400">No slug</span>
                    )}
                    {item.slug ? (
                      <RegenerateCoverButton slug={item.slug} path={item.sourcePath || undefined} />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!repo && (
        <p className="mt-4 text-xs text-amber-700">Tip: set GH_REPO in env (e.g. scanminer/scanminers-website) to enable &quot;Edit on GitHub&quot; links.</p>
      )}
    </div>
  );
}

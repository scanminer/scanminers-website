"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RegenerateCoverButton } from "@/components/RegenerateCoverButton";
import { ApproveButton } from "@/components/ApproveButton";
import { PublishButton } from "@/components/PublishButton";

type QueueItem = {
  type: "insight" | "case-study" | "brief";
  title: string;
  slug?: string | null;
  sourcePath?: string | null;
};

export function AdminQueueClient({ items, repo }: { items: QueueItem[]; repo?: string | null }) {
  const [filter, setFilter] = useState<"all" | "insight" | "case-study" | "brief">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (filter !== "all" && i.type !== filter) return false;
      if (!q) return true;
      const hay = `${i.title} ${i.slug ?? ""} ${i.sourcePath ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [items, filter, q]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex gap-1">
          {(["all", "insight", "case-study", "brief"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={
                "rounded border px-2 py-1 " +
                (filter === k ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50")
              }
            >
              {k}
            </button>
          ))}
        </div>
        <input
          placeholder="Search title/slug/path"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-[220px] flex-1 rounded border px-2 py-1"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-600">No matching items.</p>
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
            {filtered.map((item, idx) => {
              const preview = item.slug
                ? item.type === "insight"
                  ? `/insights/${item.slug}`
                  : item.type === "case-study"
                  ? `/case-studies/${item.slug}`
                  : null
                : null;
              const edit = repo && item.sourcePath ? `https://github.com/${repo}/edit/main/${item.sourcePath}` : null;
              return (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2 capitalize">{item.type.replace("-", " ")}</td>
                  <td className="py-2">{item.title}</td>
                  <td className="py-2 flex flex-wrap items-center gap-3">
                    {preview ? (
                      <Link className="text-blue-600 hover:underline" href={preview} target="_blank">
                        Preview
                      </Link>
                    ) : (
                      <span className="text-gray-400">No preview</span>
                    )}
                    {edit ? (
                      <a className="text-blue-600 hover:underline" href={edit} target="_blank" rel="noreferrer">
                        Edit on GitHub
                      </a>
                    ) : (
                      <span className="text-gray-400">Set GH_REPO</span>
                    )}
                    {item.slug ? (
                      <>
                        <RegenerateCoverButton slug={item.slug} path={item.sourcePath ?? undefined} />
                        {repo ? (
                          <a
                            className="text-blue-600 hover:underline"
                            href={`https://github.com/${repo}/actions?query=workflow%3A%22Regenerate+Post+Image%22`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Actions
                          </a>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-gray-400">No slug</span>
                    )}
                    <ApproveButton slug={item.slug} path={item.sourcePath} />
                    <PublishButton slug={item.slug} path={item.sourcePath} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

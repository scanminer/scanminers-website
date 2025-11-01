// app/api/admin/image-run-status/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const branch = url.searchParams.get("branch") || "main";

    const repoFull = (process.env.GH_REPO || process.env.CONTENT_REPO || process.env.GITHUB_REPOSITORY || "").toString();
    if (!repoFull.includes("/")) return NextResponse.json({ ok: false, error: "Missing repo env" }, { status: 500 });
    const [owner, repo] = repoFull.split("/");

    const token = process.env.WORKFLOW_DISPATCH_TOKEN || process.env.CONTENT_BOT_TOKEN || "";
    if (!token) return NextResponse.json({ ok: false, error: "Missing workflow token" }, { status: 500 });

    const runsResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/regenerate-image.yml/runs?branch=${encodeURIComponent(branch)}&event=workflow_dispatch&per_page=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    });

    if (!runsResp.ok) {
      const t = await runsResp.text().catch(() => "");
      return NextResponse.json({ ok: false, error: `GitHub error ${runsResp.status}: ${t}` }, { status: 502 });
    }

    const j = await runsResp.json();
    const run = (j?.workflow_runs?.[0]) || null;
    if (!run) return NextResponse.json({ ok: true, hasRun: false });

    return NextResponse.json({
      ok: true,
      hasRun: true,
      id: run.id,
      status: run.status, // queued | in_progress | completed | etc
      conclusion: run.conclusion, // success | failure | neutral | cancelled | timed_out | action_required
      url: run.html_url,
      created_at: run.created_at,
      updated_at: run.updated_at,
      head_branch: run.head_branch,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

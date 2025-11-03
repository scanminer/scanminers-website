import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { z } from "zod";
import matter from "gray-matter";
import simpleGit from "simple-git";

export const runtime = "nodejs";
export const revalidate = 0; // avoid caching; ensure fresh response

const InputSchema = z.object({
  title: z.string().min(5),
  context: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
});

function kebab(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function writeFileAtomic(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, content, "utf8");
}

export async function POST(req: NextRequest) {
  try {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ENABLE_INITIATE_API !== "true"
    ) {
      return NextResponse.json(
        { ok: false, error: "Disabled in production" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, context, tags } = InputSchema.parse(body);

    // Ensure unique slug; append -2, -3, ... if file exists
    const baseSlug = kebab(title);
    let slug = baseSlug;
    let candidatePath = path.join(process.cwd(), "content", "briefs", `${slug}.md`);
    let n = 2;
    while (fs.existsSync(candidatePath)) {
      slug = `${baseSlug}-${n++}`;
      candidatePath = path.join(process.cwd(), "content", "briefs", `${slug}.md`);
    }
    const relPath = path.join("content", "briefs", `${slug}.md`);
    const absPath = candidatePath;

    const fm = {
      title,
      slug,
      status: "New Brief",
      tags,
      publishedAt: new Date().toISOString(),
    };
    const md = matter.stringify(context || "", fm);

    await writeFileAtomic(absPath, md);

    let branch = `brief/${slug}`;
    try {
      const git = simpleGit({ baseDir: process.cwd() });
      const current = await git.revparse(["--abbrev-ref", "HEAD"]).catch(() => "main");
      await git.checkoutLocalBranch(branch);
      await git.add(relPath);
      await git.commit(`chore(brief): initiate '${title}'`);
      // Try push; if it fails (no creds), ignore and return file info
      await git.push(["-u", "origin", branch]).catch(() => {});
      // switch back to original branch to avoid leaving repo dirty
      await git.checkout(current);
    } catch {
      // Non-fatal: local create still succeeded
      branch = `brief/${slug}`;
    }

    return NextResponse.json({ ok: true, slug, filePath: relPath, branch });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Invalid input";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

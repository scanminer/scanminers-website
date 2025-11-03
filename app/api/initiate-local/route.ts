import { NextRequest, NextResponse } from "next/server";

export const runtime = process.env.NODE_ENV === "development" ? "nodejs" : "edge";
export const revalidate = 0;

function kebab(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { ok: false, error: "initiate-local is disabled (dev-only). Use /admin/initiate locally or the GitHub Action in prod." },
        { status: 403 }
      );
    }

    // Dynamically import Node-only modules to avoid bundling issues for Edge builds
    const [{ default: matter }, { default: simpleGit }, path, fs, { z }] = await Promise.all([
      import("gray-matter"),
      import("simple-git"),
      import("path"),
      import("fs"),
      import("zod"),
    ]);

    const InputSchema = z.object({
      title: z.string().min(5),
      context: z.string().optional().default(""),
      tags: z.array(z.string()).optional().default([]),
    });

    const body = await req.json();
    const { title, context, tags } = InputSchema.parse(body);

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

    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    await fs.promises.writeFile(absPath, md, "utf8");

    let branch = `brief/${slug}`;
    try {
      const git = simpleGit({ baseDir: process.cwd() });
      const current = await git.revparse(["--abbrev-ref", "HEAD"]).catch(() => "main");
      await git.checkoutLocalBranch(branch);
      await git.add(relPath);
      await git.commit(`chore(brief): initiate '${title}'`);
      await git.push(["-u", "origin", branch]).catch(() => {});
      await git.checkout(current);
    } catch {
      branch = `brief/${slug}`;
    }

    return NextResponse.json({ ok: true, slug, filePath: relPath, branch });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Invalid input";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

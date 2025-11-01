/*
Regenerate a cover image for an existing post.
- INPUT: POST_SLUG (env) or path to MDX via POST_PATH
- Uses imagePrompt from frontmatter if present; otherwise uses title to build a default prompt
- Writes compressed webp to public/images/uploads/{slug}.webp
- Updates frontmatter image path and preserves imagePrompt and imageAlt
- Commits change to a new branch and opens a PR

ENV required: GH_TOKEN, GITHUB_REPOSITORY
Optional: STABILITY_API_KEY
*/

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const sharp = require('sharp');
const { Octokit } = require('@octokit/rest');

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
}

async function generateAndSaveImage(prompt, slug) {
  const stabilityKey = process.env.STABILITY_API_KEY;
  if (!stabilityKey) {
    console.warn('STABILITY_API_KEY is not set. Skipping image generation.');
    return null;
  }

  console.log(`Generating image with prompt: "${prompt}"`);
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('output_format', 'webp');
  form.append('aspect_ratio', '16:9');

  let resp;
  try {
    resp = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stabilityKey}`,
        Accept: 'image/*',
      },
      body: form,
    });
  } catch (networkErr) {
    console.warn('Network error calling Stability API, skipping image generation:', networkErr?.message || networkErr);
    return null;
  }

  if (!resp.ok) {
    const ct = resp.headers.get('content-type') || '';
    const errText = ct.includes('application/json') ? JSON.stringify(await resp.json()) : await resp.text();
    console.warn(`Stability API image generation failed ${resp.status}: ${errText}`);
    return null;
  }

  const arr = await resp.arrayBuffer();
  const rawBuffer = Buffer.from(arr);
  const imageDir = path.join(process.cwd(), 'public', 'images', 'uploads');
  await fs.promises.mkdir(imageDir, { recursive: true });
  const imagePath = path.join(imageDir, `${slug}.webp`);
  const publicUrl = `/images/uploads/${slug}.webp`;

  await sharp(rawBuffer).webp({ quality: 80 }).toFile(imagePath);
  console.log(`Image saved and compressed to ${imagePath}`);
  const imageBuffer = await fs.promises.readFile(imagePath);
  return { imageUrl: publicUrl, imageBuffer };
}

function defaultPrompt(title) {
  return `A professional, high-impact hero image for an article titled: ${title}. Photorealistic or technical illustration, earth-tone palette, 16:9.`;
}

async function run() {
  const githubToken = process.env.GH_TOKEN;
  const repoFull = process.env.GITHUB_REPOSITORY || '';
  const postSlug = process.env.POST_SLUG;
  const postPathEnv = process.env.POST_PATH;
  const baseBranch = process.env.BASE_BRANCH || 'main';

  if (!githubToken || !repoFull) {
    throw new Error('Missing required env (GH_TOKEN, GITHUB_REPOSITORY).');
  }

  const [owner, repo] = repoFull.split('/');
  if (!owner || !repo) throw new Error(`Invalid GITHUB_REPOSITORY: ${repoFull}`);

  const octokit = new Octokit({ auth: githubToken });

  // Resolve content either from local checkout or directly from GitHub (base branch)
  let repoMdxPath = null;
  let rawContent = null;

  async function tryReadLocal(p) {
    try {
      const raw = await fs.promises.readFile(p, 'utf8');
      return raw;
    } catch {
      return null;
    }
  }

  async function tryReadRemote(p) {
    try {
      const res = await octokit.repos.getContent({ owner, repo, path: p, ref: baseBranch });
      if (Array.isArray(res.data)) return null;
      const b64 = res.data.content || '';
      const buff = Buffer.from(b64, 'base64');
      return buff.toString('utf8');
    } catch {
      return null;
    }
  }

  const candidates = [];
  if (postPathEnv) {
    const rel = postPathEnv.replace(/^\/+/, '');
    candidates.push(rel);
  } else {
    if (!postSlug) throw new Error('Provide POST_SLUG or POST_PATH');
    candidates.push(
      path.posix.join('content', 'insights', `${postSlug}.mdx`),
      path.posix.join('content', 'case-studies', `${postSlug}.mdx`),
      path.posix.join('content', 'briefs', `${postSlug}.md`),
    );
  }

  for (const rel of candidates) {
    // Try local first
    const localPath = path.join(process.cwd(), rel);
    rawContent = await tryReadLocal(localPath);
    if (rawContent) { repoMdxPath = rel; break; }
    // Try remote on baseBranch
    rawContent = await tryReadRemote(rel);
    if (rawContent) { repoMdxPath = rel; break; }
  }

  if (!rawContent || !repoMdxPath) {
    throw new Error(`Could not resolve file for slug/path. Tried (ref=${baseBranch}): ${candidates.join(', ')}`);
  }

  const parsed = matter(rawContent);
  const fm = parsed.data || {};

  const baseName = path.basename(repoMdxPath, path.extname(repoMdxPath));
  const title = fm.title || postSlug || baseName;
  const promptOverride = process.env.PROMPT_OVERRIDE;
  const prompt = promptOverride || fm.imagePrompt || defaultPrompt(title);
  const slug = slugify(postSlug || fm.slug || baseName);

  const imageResult = await generateAndSaveImage(prompt, slug);
  if (!imageResult) {
    console.warn('No image generated. Nothing to commit.');
    return;
  }

  // Update MDX frontmatter: image path preserved under public url; keep existing alt/prompt
  fm.image = imageResult.imageUrl;
  fm.imagePrompt = prompt; // persist last used prompt
  if (!fm.imageAlt) fm.imageAlt = `Illustrative image for ${title}`;

  const mdxOut = matter.stringify(parsed.content, fm);

  // Octokit already initialized; baseBranch already computed

  console.log(`Fetching base branch ref: ${baseBranch}`);
  const baseRef = await octokit.git.getRef({ owner, repo, ref: `heads/${baseBranch}` });
  const baseSha = baseRef.data.object.sha;

  const branchName = `content/image-refresh/${slug}-${Date.now().toString().slice(-6)}`;
  console.log(`Creating feature branch: ${branchName}`);
  await octokit.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: baseSha });

  async function upsertFile(filePathRel, contentBuffer, message) {
    let sha;
    try {
      const existing = await octokit.repos.getContent({ owner, repo, path: filePathRel, ref: branchName });
      if (!Array.isArray(existing.data) && existing.data.sha) sha = existing.data.sha;
    } catch (err) { if (err.status !== 404) throw err; }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch: branchName,
      path: filePathRel,
      message,
      content: contentBuffer.toString('base64'),
      sha,
    });
  }

  // Update the MDX on branch
  await upsertFile(repoMdxPath, Buffer.from(mdxOut), `feat(image): regenerate cover for '${title}'`);

  // Add/Update the image binary on branch
  const imagePathRel = imageResult.imageUrl.slice(1);
  await upsertFile(imagePathRel, imageResult.imageBuffer, `feat(image): add regenerated cover for '${title}'`);

  // Open PR
  await octokit.pulls.create({
    owner,
    repo,
    title: `Regenerate cover image: ${title}`,
    head: branchName,
    base: baseBranch,
    body: `Regenerated cover image using prompt saved in frontmatter.\n\n- Post: ${repoMdxPath}\n- New image: ${imageResult.imageUrl}\n- Prompt: ${prompt}`,
  });

  console.log('Image regeneration PR opened.');
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}

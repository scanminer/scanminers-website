/*
 Phase 1: Generate draft from a brief + cover image
 - Reads a brief MD file path from BRIEF_FILE_PATH
 - Calls Perplexity for article content
 - Extracts image prompt + alt text
 - Generates + compresses a cover image with Stability AI
 - Commits MDX + image to repo using Octokit
*/

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
// Use global fetch available in Node 20+
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
  // Use Stability AI REST API directly to avoid SDK dependency
  const resp = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stabilityKey}`,
      'Content-Type': 'application/json',
      Accept: 'image/*',
    },
    body: JSON.stringify({
      prompt,
      output_format: 'webp',
      aspect_ratio: '16:9',
    }),
  });

  if (!resp.ok) {
    const ct = resp.headers.get('content-type') || '';
    const errText = ct.includes('application/json') ? JSON.stringify(await resp.json()) : await resp.text();
    throw new Error(`Stability API error ${resp.status}: ${errText}`);
  }

  const arr = await resp.arrayBuffer();
  const rawBuffer = Buffer.from(arr);
  const imageDir = path.join(process.cwd(), 'public', 'images', 'uploads');
  await fs.promises.mkdir(imageDir, { recursive: true });
  const imagePath = path.join(imageDir, `${slug}.webp`);
  const publicUrl = `/images/uploads/${slug}.webp`;

  // Recompress to ensure desired quality/size characteristics
  await sharp(rawBuffer).webp({ quality: 80 }).toFile(imagePath);
  console.log(`Image saved and compressed to ${imagePath}`);
  const imageBuffer = await fs.promises.readFile(imagePath);
  return { imageUrl: publicUrl, imageBuffer };
}

const getPerplexityPrompt = (topic, expertContext = '') => `
You are a meticulous research analyst specializing in remote sensing and mineral exploration. Your task is to create a comprehensive article on the topic: "${topic}"\n\n${expertContext ? `Context from brief (use to tailor content):\n${expertContext}\n` : ''}

Structure:\n- Executive Summary (200-300 words)\n- Key Data Points (bulleted, each with URL citation)\n- Recent Findings & Case Studies (3-5)\n- Challenges & Future Trends\n- Full Citations (APA style with URLs)\n\nRules:\n- Every claim MUST have a verifiable URL citation.\n- Prioritize sources published after 2022.\n- Do not hallucinate.
\n## Visuals\nImage Prompt: A professional, high-tech, earth-tone cover image related to ${topic}, photorealistic or technical illustration, suitable as a hero cover.\nAlt Text: A concise, descriptive alt text for accessibility.
`;

async function run() {
  try {
    const githubToken = process.env.GH_TOKEN;
    const perplexityKey = process.env.PERPLEXITY_KEY;
    const stabilityKey = process.env.STABILITY_API_KEY; // New
    const newBriefFile = process.env.BRIEF_FILE_PATH;
    const repoFull = process.env.GITHUB_REPOSITORY || '';

    if (!githubToken || !perplexityKey || !stabilityKey || !newBriefFile) {
      throw new Error('Missing required env (GH_TOKEN, PERPLEXITY_KEY, STABILITY_API_KEY, BRIEF_FILE_PATH).');
    }

    const briefContent = await fs.promises.readFile(newBriefFile, 'utf8');
    const { data: frontmatter } = matter(briefContent);
    const topic = frontmatter.title || path.basename(newBriefFile, path.extname(newBriefFile));
    const expertContext = frontmatter.context || '';

    // Call Perplexity
    console.log('Querying Perplexity for article + visuals...');
    const prompt = getPerplexityPrompt(topic, expertContext);
    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: 'Be precise and factual.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      throw new Error(`Perplexity API error ${resp.status}: ${await resp.text()}`);
    }
    const data = await resp.json();
    const full = data.choices?.[0]?.message?.content || '';

    // Parse article vs visuals
    const parts = full.split('## Visuals');
    const articleText = parts[0]?.trim() || full.trim();
    const visuals = parts[1] || '';
    const mPrompt = visuals.match(/Image Prompt:\s*(.*)/);
    const imagePrompt = (mPrompt && mPrompt[1].trim()) || `A professional abstract image representing: ${topic}`;
    const mAlt = visuals.match(/Alt Text:\s*(.*)/);
    const imageAlt = (mAlt && mAlt[1].trim()) || `Illustrative image for ${topic}`;

    // Generate image
    const slug = slugify(topic);
    const imageResult = await generateAndSaveImage(imagePrompt, slug);

    // MDX content
    const mdx = `---\ntitle: "${topic}"\nsummary: "A brief summary of the key findings. Please review and edit."\npublishedAt: "${new Date().toISOString().slice(0, 10)}"\nreview_status: "needs-review"\nai_generated: true\ntags: ["AI", "Geoscience", "Draft"]\nimage: "${imageResult ? imageResult.imageUrl : ''}"\nimageAlt: "${imageAlt}"\n---\n\n${articleText}\n`;

    // Commit via Octokit on a feature branch, then open a PR
    const [owner, repo] = repoFull.split('/');
    if (!owner || !repo) throw new Error(`Invalid GITHUB_REPOSITORY: ${repoFull}`);

    const octokit = new Octokit({ auth: githubToken });
    const baseBranch = process.env.BASE_BRANCH || 'main';

    // Determine base SHA
    console.log(`Fetching base branch ref: ${baseBranch}`);
    const baseRef = await octokit.git.getRef({ owner, repo, ref: `heads/${baseBranch}` });
    const baseSha = baseRef.data.object.sha;

    // Create a new branch for the draft
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let branchName = `content/draft/${slug}-${today}`;
    async function createBranch(name) {
      return octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${name}`,
        sha: baseSha,
      });
    }

    console.log(`Creating feature branch: ${branchName}`);
    try {
      await createBranch(branchName);
    } catch (e) {
      if (e.status === 422) {
        // Branch exists; append a short random suffix
        const suffix = Math.random().toString(36).slice(2, 6);
        branchName = `content/draft/${slug}-${today}-${suffix}`;
        console.log(`Branch exists, trying: ${branchName}`);
        await createBranch(branchName);
      } else {
        throw e;
      }
    }

    // Helper to upsert files on the branch
    async function upsertFile(filePath, contentBuffer, message) {
      let sha;
      try {
        const existing = await octokit.repos.getContent({ owner, repo, path: filePath, ref: branchName });
        if (!Array.isArray(existing.data) && existing.data.sha) sha = existing.data.sha;
      } catch (err) {
        // 404 means new file
        if (err.status !== 404) throw err;
      }

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        branch: branchName,
        path: filePath,
        message,
        content: contentBuffer.toString('base64'),
        sha,
      });
    }

    const contentPath = `content/insights/${slug}.mdx`;
    console.log('Creating/Updating content file on feature branch...');
    await upsertFile(contentPath, Buffer.from(mdx), `feat(content): add AI draft for '${topic}'`);

    if (imageResult) {
      const imagePathRel = imageResult.imageUrl.slice(1);
      console.log('Creating/Updating image file on feature branch...');
      await upsertFile(imagePathRel, imageResult.imageBuffer, `feat(image): add cover for '${topic}'`);
    }

    // Open PR
    console.log('Opening pull request...');
    let pr;
    try {
      pr = await octokit.pulls.create({
        owner,
        repo,
        title: `AI draft: ${topic}`,
        head: branchName,
        base: baseBranch,
        body: `This PR adds an AI-generated draft for '${topic}'.\n\n- Source brief: ${newBriefFile}\n- Image: ${imageResult ? imageResult.imageUrl : 'none'}\n- Review status: needs-review\n\nPlease review content, citations, and scheduling fields (publishedAt, review_status).`,
      });
    } catch (e) {
      if (e.status === 422) {
        console.warn('PR already exists for this branch or similar head.');
      } else {
        throw e;
      }
    }

    console.log(`Draft prepared on branch '${branchName}'. ${pr?.data?.html_url ? `PR: ${pr.data.html_url}` : ''}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

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
const fetch = require('node-fetch');
const sharp = require('sharp');
const { Octokit } = require('@octokit/rest');
const { createStabilityClient } = require('@stability/sdk');

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
  const stability = createStabilityClient({ key: stabilityKey });
  const { images } = await stability.image.generate({
    prompt,
    model: 'sd3',
    output_format: 'webp',
    aspect_ratio: '16:9',
  });

  if (!images || images.length === 0) {
    throw new Error('Stability AI API did not return any images.');
  }

  const image = images[0];
  const imageDir = path.join(process.cwd(), 'public', 'images', 'uploads');
  await fs.promises.mkdir(imageDir, { recursive: true });
  const imagePath = path.join(imageDir, `${slug}.webp`);
  const publicUrl = `/images/uploads/${slug}.webp`;

  await sharp(image.buffer).webp({ quality: 80 }).toFile(imagePath);
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

    // Commit via Octokit
    const [owner, repo] = repoFull.split('/');
    if (!owner || !repo) throw new Error(`Invalid GITHUB_REPOSITORY: ${repoFull}`);

    const octokit = new Octokit({ auth: githubToken });
    const branch = 'main';

    console.log('Creating/Updating content file...');
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch,
      path: `content/insights/${slug}.mdx`,
      message: `feat(content): add AI draft for '${topic}'`,
      content: Buffer.from(mdx).toString('base64'),
    });

    if (imageResult) {
      console.log('Creating/Updating image file...');
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        branch,
        path: imageResult.imageUrl.slice(1),
        message: `feat(image): add cover for '${topic}'`,
        content: imageResult.imageBuffer.toString('base64'),
      });
    }

    console.log('Draft + image committed successfully.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

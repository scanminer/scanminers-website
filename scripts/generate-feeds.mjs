#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import RSS from 'rss';
import { allInsights, allCaseStudies } from '../.contentlayer/generated/index.mjs';

const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://scanminers.com';
const absoluteUrl = (p) => new URL(p, site).toString();

async function writeFeed(filename, items, meta) {
  const feed = new RSS(meta);
  items.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.summary,
      url: absoluteUrl(post.url),
      date: new Date(post.publishedAt),
      guid: post.url,
    });
  });
  const xml = feed.xml({ indent: true });
  const out = path.join(process.cwd(), 'public', filename);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, xml, 'utf8');
}

async function main() {
  const insights = [...allInsights].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const caseStudies = [...allCaseStudies].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  await writeFeed('insights/feed.xml', insights, {
    title: 'Scanminers Insights',
    description: 'Insights from Scanminers',
    site_url: absoluteUrl('/insights'),
    feed_url: absoluteUrl('/insights/feed.xml'),
    language: 'en',
  });

  await writeFeed('case-studies/feed.xml', caseStudies, {
    title: 'Scanminers Case Studies',
    description: 'Case studies from Scanminers',
    site_url: absoluteUrl('/case-studies'),
    feed_url: absoluteUrl('/case-studies/feed.xml'),
    language: 'en',
  });
}

main().catch((err) => {
  console.error('[feeds] generation failed', err);
  process.exit(1);
});

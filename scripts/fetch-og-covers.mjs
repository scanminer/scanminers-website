#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import matter from 'gray-matter';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const SITE = process.env.SITE_URL || 'http://localhost:3000';
const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'og');
fs.mkdirSync(OUT_DIR, { recursive: true });

function slugFrom(p) {
  const parts = p.split(path.sep);
  // content/<type>/<slug>/index.mdx
  return parts[parts.length - 2];
}

function normalizeTitle(s, fallback) {
  const t = (s || fallback || '').toString().trim();
  return t.slice(0, 120);
}

async function fetchOg({ title, kicker, colorway, slug }) {
  const u = new URL('/og', SITE);
  u.searchParams.set('title', title);
  u.searchParams.set('kicker', kicker);
  if (colorway) u.searchParams.set('colorway', colorway);
  const res = await fetch(u, { headers: { Accept: 'image/png' } });
  if (!res.ok) throw new Error(`OG fetch failed ${res.status}: ${await res.text().catch(() => '')}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // compress PNG a bit for social
  const optimized = await sharp(buf).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
  const out = path.join(OUT_DIR, `${slug}.png`);
  fs.writeFileSync(out, optimized);
  return out;
}

async function waitReady(url, tries = 30) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { method: 'HEAD' }); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Server not ready');
}

function changedMd() {
  try {
    const baseRef = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : 'HEAD~1';
    const out = execSync(`git diff --name-only ${baseRef} HEAD -- content/insights/**/index.mdx content/case-studies/**/index.mdx`, { stdio: ['ignore','pipe','pipe'] }).toString().trim();
    return out.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

async function main() {
  // ensure server ready (CI)
  try { await waitReady(`${SITE}/`); } catch (e) { console.warn(String(e)); }

  const patterns = [
    'content/insights/*/index.mdx',
    'content/case-studies/*/index.mdx',
  ];
  let files = await globby(patterns, { gitignore: true });

  const changed = changedMd();
  if (changed.length) {
    const changedSet = new Set(changed.map(f => path.resolve(f)));
    files = files.filter(f => changedSet.has(path.resolve(f)));
    if (!files.length) {
      console.log('No changed content files to process.');
      return;
    }
  }
  let count = 0;
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data } = matter(raw);
    const slug = slugFrom(file);
    const isInsight = file.includes('content/insights/');
    const kicker = isInsight ? 'Insights' : 'Case Study';
    const colorway = data?.brand?.colorway || 'slate-orange';
    const title = normalizeTitle(data?.title, slug);
    const out = await fetchOg({ title, kicker, colorway, slug }).catch((e) => {
      console.error('Failed OG for', slug, e.message);
      return null;
    });
    if (out) {
      console.log('OG exported:', path.relative(process.cwd(), out));
      count++;
    }
  }
  console.log(`Done. Exported ${count} og images.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

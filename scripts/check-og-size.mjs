#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public', 'images', 'og');
if (!fs.existsSync(dir)) {
  console.log('No OG directory present; skipping check.');
  process.exit(0);
}
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
if (!files.length) {
  console.log('No OG images found; skipping check.');
  process.exit(0);
}
const MAX = 1024 * 1024; // 1MB
let failures = 0;
for (const f of files) {
  const p = path.join(dir, f);
  const stat = fs.statSync(p);
  const kb = Math.round(stat.size / 1024);
  if (stat.size > MAX) {
    console.error(`OG image too large (>1MB): ${f} (${kb} KB)`);
    failures++;
  } else {
    console.log(`OK: ${f} (${kb} KB)`);
  }
}
if (failures) {
  console.error(`${failures} OG images exceed 1MB.`);
  process.exit(1);
}
console.log('All OG images are within size limits.');

#!/usr/bin/env node
/*
 Verifies that all app/api routes:
  - export a literal `runtime = 'edge'`
  - do not use top-level Node built-in imports (fs, path, child_process, etc.)

 Allows dynamic imports inside the handler (e.g., dev-only code) since those
 are not bundled for Edge if guarded and/or webpackIgnored.
*/

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(process.cwd(), 'app', 'api');

/** @param {string} dir */
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(p));
    else if (e.isFile() && /\.(t|j)sx?$/.test(e.name)) files.push(p);
  }
  return files;
}

function hasLiteralEdgeRuntime(src) {
  // Must be: export const runtime = 'edge'; or "edge"
  // Avoid matching ternaries or non-string expressions.
  const re = /export\s+const\s+runtime\s*=\s*['\"]edge['\"];?/;
  return re.test(src);
}

function findTopLevelNodeImports(src) {
  // Report only top-level ESM imports of node/builtins most problematic on Edge.
  const lines = src.split(/\r?\n/);
  const offenders = [];
  const badPkgs = [
    'fs', 'node:fs', 'path', 'node:path', 'child_process', 'node:child_process',
    'os', 'node:os', 'net', 'node:net', 'tls', 'node:tls', 'http', 'node:http',
    'https', 'node:https', 'stream', 'node:stream', 'buffer', 'node:buffer',
    'simple-git', 'gray-matter'
  ];
  const importRe = /^\s*import\s+[^;]+?from\s+['\"]([^'\"]+)['\"];?\s*$/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(importRe);
    if (m) {
      const spec = m[1];
      if (badPkgs.includes(spec)) offenders.push({ line: i + 1, spec });
    }
  }
  return offenders;
}

function main() {
  if (!fs.existsSync(API_DIR)) {
    console.log('No app/api directory found, skipping');
    return;
  }
  const files = walk(API_DIR);
  let failed = false;
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');

    // Skip Next.js generated files or d.ts
    if (/\.(d|test)\.ts$/.test(file)) continue;

    const runtimeOk = hasLiteralEdgeRuntime(src);
    if (!runtimeOk) {
      console.error(`[edge-check] Missing literal runtime=\'edge\' in ${path.relative(process.cwd(), file)}`);
      failed = true;
    }

    const imports = findTopLevelNodeImports(src);
    if (imports.length) {
      for (const imp of imports) {
        console.error(`[edge-check] Top-level Node import '${imp.spec}' at ${path.relative(process.cwd(), file)}:${imp.line}`);
      }
      failed = true;
    }
  }

  if (failed) {
    process.exit(1);
  } else {
    console.log('[edge-check] All app/api routes are edge-safe ✅');
  }
}

main();

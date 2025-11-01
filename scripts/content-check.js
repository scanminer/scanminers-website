#!/usr/bin/env node
/**
 * Orchestrates local content quality checks:
 * - Contentlayer build (using our wrapper)
 * - Image alt/size checks
 * - Ensure AI-generated content has citations
 * - Semantic QA (skips drafts/needs-review)
 */
const { spawn } = require('node:child_process');
const path = require('node:path');
const globby = require('globby');

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} failed with code ${code}`))));
  });
}

(async () => {
  const root = process.cwd();
  try {
    // 1) Build contentlayer artifacts
    await run(process.execPath, [path.join(root, 'scripts', 'contentlayer-build.js')]);

    // 2) Image alt/size checks
    await run(process.execPath, [path.join(root, 'scripts', 'check-alt-and-size.js')]);

    // 3) Ensure citations for AI-generated content
    const files = globby.sync(['content/**/*.mdx']);
    if (files.length) {
      await run(process.execPath, [path.join(root, 'scripts', 'ensure-citations.js'), ...files]);
    }

    // 4) Semantic QA
    await run(process.execPath, [path.join(root, 'scripts', 'semantic-qa.js')]);

    console.log('✅ Content checks passed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Content checks failed:\n', err.message || err);
    process.exit(1);
  }
})();

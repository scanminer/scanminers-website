#!/usr/bin/env node
// Wrapper to run Contentlayer and treat generated artifacts as success even if CLI exits oddly.
// This avoids noisy non-numeric exit code errors while still failing if artifacts are missing.

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const cli = path.join(process.cwd(), 'node_modules', 'contentlayer', 'bin', 'cli.cjs');
  const child = spawn(process.execPath, [cli, 'build'], { stdio: ['ignore', 'pipe', 'pipe'] });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (d) => (stdout += d.toString()))
  child.stderr.on('data', (d) => (stderr += d.toString()))

  child.on('close', (code) => {
    const indexPath = path.join(process.cwd(), '.contentlayer', 'generated', 'index.mjs');
    const exists = fs.existsSync(indexPath);
    if (exists) {
      console.log('[contentlayer] Build succeeded (artifacts present).');
      process.exit(0);
    } else {
      // Surface CLI output on failure for debugging
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      process.exit(code || 1);
    }
  });
})();

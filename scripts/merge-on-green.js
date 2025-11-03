#!/usr/bin/env node
/*
 Poll a PR's combined status until success, then merge it (squash).
 Usage:
   PR_NUMBER=48 node scripts/merge-on-green.js

 Env:
   - CONTENT_BOT_TOKEN (or WORKFLOW_DISPATCH_TOKEN)
   - GH_REPO (owner/repo)
*/

const https = require('https');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const req = https.request({
      method,
      hostname: 'api.github.com',
      path,
      headers: {
        'User-Agent': 'scanminers-bot',
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => {
        const status = res.statusCode || 0;
        if (status >= 200 && status < 300) {
          try { resolve(JSON.parse(buf)); } catch { resolve({ ok: true, raw: buf }); }
        } else {
          reject(new Error(`GitHub ${status}: ${buf}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async function main() {
  const token = process.env.CONTENT_BOT_TOKEN || process.env.WORKFLOW_DISPATCH_TOKEN;
  const repoFull = process.env.GH_REPO || process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER || process.env.PR || process.argv[2];
  const maxAttempts = Number(process.env.MAX_ATTEMPTS || 120); // ~40 minutes @ 20s
  const delayMs = Number(process.env.DELAY_MS || 20000);

  if (!token) throw new Error('Missing CONTENT_BOT_TOKEN');
  if (!repoFull || !repoFull.includes('/')) throw new Error('Missing GH_REPO');
  if (!prNumber) throw new Error('Missing PR_NUMBER');

  const [owner, repo] = repoFull.split('/');

  // Get PR to obtain head SHA
  const pr = await request('GET', `/repos/${owner}/${repo}/pulls/${prNumber}`, undefined, token);
  const sha = pr?.head?.sha;
  if (!sha) throw new Error('No head SHA for PR');

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      const st = await request('GET', `/repos/${owner}/${repo}/commits/${sha}/status`, undefined, token);
      const state = st?.state; // success | failure | pending
      console.log(`[merge-on-green] Attempt ${attempt}/${maxAttempts} — combined: ${state}`);
      if (state === 'success') break;
    } catch (e) {
      console.warn('[merge-on-green] Status read error, retrying...');
    }
    await sleep(delayMs);
  }

  if (attempt >= maxAttempts) {
    console.error('[merge-on-green] Timeout waiting for green checks');
    process.exit(2);
  }

  // Ensure mergeable
  const pr2 = await request('GET', `/repos/${owner}/${repo}/pulls/${prNumber}`, undefined, token);
  if (pr2.mergeable === false) {
    console.error('[merge-on-green] PR is not mergeable (conflicts or review block).');
    process.exit(3);
  }

  // Merge (squash)
  await request('PUT', `/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
    merge_method: 'squash',
  }, token);
  console.log(`[merge-on-green] ✅ Merged PR #${prNumber}`);
})();

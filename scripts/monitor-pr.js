#!/usr/bin/env node
/*
 Monitor a PR's checks and print status summary.
 Usage:
   PR_NUMBER=48 node scripts/monitor-pr.js

 Requires env:
   - CONTENT_BOT_TOKEN
   - GH_REPO (owner/repo)
*/

const https = require('https');

function request(path, token) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      method: 'GET',
      hostname: 'api.github.com',
      path,
      headers: {
        'User-Agent': 'scanminers-bot',
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
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
    req.end();
  });
}

function pick(arr, fn) { return (arr || []).filter(Boolean).map(fn); }

(async function main() {
  try {
    const token = process.env.CONTENT_BOT_TOKEN || process.env.WORKFLOW_DISPATCH_TOKEN;
    const repoFull = process.env.GH_REPO || process.env.GITHUB_REPOSITORY;
    const prNumber = process.env.PR_NUMBER || process.env.PR || process.argv[2];

    if (!token) throw new Error('Missing CONTENT_BOT_TOKEN');
    if (!repoFull || !repoFull.includes('/')) throw new Error('Missing GH_REPO');
    if (!prNumber) throw new Error('Missing PR_NUMBER (env or argv)');

    const [owner, repo] = repoFull.split('/');

    const pr = await request(`/repos/${owner}/${repo}/pulls/${prNumber}`, token);
    const sha = pr.head?.sha;
    const headRef = pr.head?.ref;

    if (!sha) throw new Error('No head SHA for PR');

    let checks = { check_runs: [] };
    try {
      checks = await request(`/repos/${owner}/${repo}/commits/${sha}/check-runs`, token);
    } catch (e) {
      console.error('checks API not accessible, continuing with commit status only');
    }
    const statuses = await request(`/repos/${owner}/${repo}/commits/${sha}/status`, token);

    const runs = checks.check_runs || [];
    const combined = statuses.state; // success | failure | pending

  const cloudflare = runs.find(r => (r.app?.name || '').toLowerCase().includes('cloudflare')) || null;
  const nextOnPages = runs.find(r => (r.name || '').toLowerCase().includes('next-on-pages')) || null;

    function summarizeRun(r) {
      if (!r) return null;
      return `${r.name} — ${r.conclusion || r.status} (${r.html_url})`;
    }

    console.log(`PR #${pr.number} ${pr.title} [${headRef}]`);
    console.log(`Combined status: ${combined}`);
    console.log('Top checks:');
    pick([cloudflare, nextOnPages], summarizeRun).forEach(line => console.log('  • ' + line));

  const checksOk = runs.length ? runs.every(r => ['success', 'skipped', 'neutral'].includes(r.conclusion || '')) : true;
  const allDone = checksOk && combined === 'success';
    if (allDone) {
      console.log('✅ All checks green');
      process.exit(0);
    } else {
      console.log('⏳ Checks not green yet');
      process.exit(2);
    }
  } catch (e) {
    console.error('monitor-pr error:', e.message || e);
    process.exit(1);
  }
})();

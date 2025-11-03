#!/usr/bin/env node
/*
 Open a GitHub PR using a fine-grained token in CONTENT_BOT_TOKEN.
 Usage:
   node scripts/open-pr.js --head fix/contentlayer-insight-seo --base main \
     --title "chore(contentlayer): allow seo field and add edge-verifier" \
     --body "This PR adds an optional seo field to Insight and a CI edge-route verifier."

 Requires env:
   - CONTENT_BOT_TOKEN
   - GH_REPO (owner/repo), e.g. scanminer/scanminers-website
*/

const https = require('https');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i];
    const v = args[i + 1];
    if (!k || !k.startsWith('--')) continue;
    out[k.slice(2)] = v;
  }
  return out;
}

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

(async function main() {
  try {
    const { head, base, title, body } = parseArgs();
    const token = process.env.CONTENT_BOT_TOKEN || process.env.WORKFLOW_DISPATCH_TOKEN;
    const repoFull = process.env.GH_REPO || process.env.GITHUB_REPOSITORY;

    if (!token) throw new Error('Missing CONTENT_BOT_TOKEN');
    if (!repoFull || !repoFull.includes('/')) throw new Error('Missing GH_REPO (owner/repo)');
    if (!head || !base || !title) throw new Error('Usage: --head <branch> --base <branch> --title <title> [--body <text>]');

    const [owner, repo] = repoFull.split('/');

    const pr = await request('POST', `/repos/${owner}/${repo}/pulls`, {
      title,
      head,
      base,
      body: body || '',
      maintainer_can_modify: true,
      draft: false,
    }, token);

    console.log(`PR created: ${pr.html_url}`);
  } catch (e) {
    console.error('open-pr error:', e.message || e);
    process.exit(1);
  }
})();

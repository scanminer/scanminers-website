# Scanminers Content Cron Worker

This Cloudflare Worker is the heart of the automated content engine for the Scanminers website.

## Functionality

The worker can be triggered in two ways:

1.  **Scheduled (Cron):** Runs automatically based on the schedule defined in `wrangler.toml`. It uses a pre-defined topic to generate a weekly draft.
2.  **Manual (Fetch):** Can be triggered by visiting its URL with a `?topic=` query parameter. This is useful for testing or generating ad-hoc drafts.

Upon triggering, it performs the following workflow:
1.  Calls the Perplexity API to generate a "Research Brief" on the given topic.
2.  Formats the response into an MDX file with the required frontmatter (`review_status: 'needs-review'`).
3.  Uses the GitHub API to:
    * Create a new branch (e.g., `content/draft-<slug>`).
    * Commit the new MDX file to the `content/insights/` directory.
    * Open a pull request against the `main` branch for human review.

### Scheduled Publishing

The worker also supports scheduled publishing of approved content:

- Any open PR that includes a content file under `content/insights/` or `content/case-studies/` will be checked for frontmatter values.
- When `review_status: approved` and `publishedAt` is a valid date-time in the past (or now), the worker will attempt to merge the PR automatically.
- If branch protection prevents auto-merge, the attempt will fail (logged) and you can merge manually when ready.

Manual trigger for scheduled publish check:

```bash
curl "https://<your-worker-url>?action=publish_due"
```

Notes:
- Ensure the GitHub token has permission to merge PRs (Write access).
- Use branch protection with required reviews to keep a human-in-the-loop; editors set `review_status: approved` when ready.

## Setup & Deployment

### Prerequisites
- `npm install -g wrangler`
- `wrangler login`

### Secrets
Before deploying, you must set the following secrets. Run these commands from within the `workers/content-cron` directory:

```bash
npx wrangler secret put GH_TOKEN
npx wrangler secret put PERPLEXITY_KEY
```

### Deployment

To deploy the worker, run:

```bash
npx wrangler deploy
```

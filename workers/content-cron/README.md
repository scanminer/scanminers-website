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

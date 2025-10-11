// workers/content-cron/src/index.ts

export interface Env {
  GH_TOKEN: string;
  PERPLEXITY_KEY: string;
  GH_REPO: string;
}

// Minimal runtime type shims for local typechecking (Cloudflare provides these at runtime)
type ScheduledController = { cron: string };
type ExecutionContext = { waitUntil(promise: Promise<unknown>): void };

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`Cron job triggered: ${controller.cron}`);
    // TODO: Fetch from Perplexity and create a PR in GH_REPO using GH_TOKEN.
  },

  // Manual testing endpoint
  async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    console.log("Manual trigger received. In the future, this will run the content generation logic.");
    return new Response("OK: Manual trigger for content cron received. Check logs.", { status: 200 });
  },
};

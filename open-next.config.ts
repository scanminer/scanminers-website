import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Default configuration works for most Next.js apps
  // OpenNext will automatically detect and configure:
  // - API routes
  // - App Router pages
  // - Static assets
  // - Middleware
});

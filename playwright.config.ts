import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: 0,
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});

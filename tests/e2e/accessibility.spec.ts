import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/technologies", "/case-studies", "/insights", "/contact"];

for (const route of routes) {
  test.describe(`a11y: ${route}`, () => {
    test(`has no color-contrast violations on ${route}`, async ({ page }) => {
      await page.goto(route);

  // Wait for primary content to render without relying on networkidle (can be noisy)
  await page.locator("main").first().waitFor({ state: "visible", timeout: 15000 });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"]) // standard WCAG rules
        .disableRules(["aria-valid-attr-value", "aria-allowed-attr"]) // reduce noise not relevant here
        .include("main")
        .withRules(["color-contrast"]) // focus on contrast
        .analyze();

      const violations = results.violations ?? [];

      if (violations.length > 0) {
        console.log(`A11y violations (${route}):`);
        for (const v of violations) {
          console.log(`- ${v.id}: ${v.help}`);
          for (const node of v.nodes) {
            console.log(`  selector: ${node.target?.join(" ")}`);
            console.log(`  summary: ${node.failureSummary}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((node as any).html) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              console.log(`  html: ${(node as any).html}`);
            }
          }
        }
      }

      expect(violations.length, `Found color-contrast violations on ${route}`).toBe(0);
    });
  });
}

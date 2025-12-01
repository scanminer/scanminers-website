import { test, expect } from "@playwright/test";

test.describe("Meetings Feature E2E Tests", () => {
  test("meetings list page loads and shows header", async ({ page }) => {
    await page.goto("/admin/meetings");

    // Check page title/header
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /meetings/i
    );

    // Check for the helper text - actual text from page.tsx
    await expect(
      page.getByText(/internal, prospect, and client meetings/i)
    ).toBeVisible();
  });

  test("meetings list shows seeded meeting", async ({ page }) => {
    await page.goto("/admin/meetings");

    // Look for the first meeting we seeded
    await expect(page.getByText(/core team alignment/i)).toBeVisible();
  });

  test("meeting detail page loads with all cards", async ({ page }) => {
    await page.goto("/admin/meetings/first-meeting-2025");

    // Check meeting title is visible
    await expect(
      page.getByRole("heading", { name: /core team alignment/i })
    ).toBeVisible();

    // Check key cards are present (Overview, Notes, Action Items, Context)
    await expect(page.getByText(/overview/i).first()).toBeVisible();
    await expect(page.getByText(/notes/i).first()).toBeVisible();
    await expect(page.getByText(/action items/i).first()).toBeVisible();
    // Card is called "Context" not "Related Context"
    await expect(page.getByText(/context/i).first()).toBeVisible();
  });

  test("meeting detail shows participants", async ({ page }) => {
    await page.goto("/admin/meetings/first-meeting-2025");

    // Check participants are shown
    await expect(page.getByText(/mahmood/i)).toBeVisible();
    await expect(page.getByText(/dr\. amin/i)).toBeVisible();
    await expect(page.getByText(/mehrtash/i)).toBeVisible();
  });

  test("meeting notes display actual seed content", async ({ page }) => {
    await page.goto("/admin/meetings/first-meeting-2025");

    // Check for actual notes content from the seed SQL
    await expect(
      page.getByText(/first core team alignment meeting/i)
    ).toBeVisible();
  });

  test("new meeting page loads with form", async ({ page }) => {
    await page.goto("/admin/meetings/new");

    // Check page header - actual text is "Log a meeting"
    await expect(
      page.getByRole("heading", { name: /log a meeting/i })
    ).toBeVisible();

    // Check form fields exist - look for Title input by placeholder
    await expect(page.getByPlaceholder(/core team alignment/i)).toBeVisible();
  });

  test("back to meetings link works from detail page", async ({ page }) => {
    await page.goto("/admin/meetings/first-meeting-2025");

    // Click back link
    await page.getByRole("link", { name: /back to meetings/i }).click();

    // Should be on meetings list
    await expect(page).toHaveURL(/\/admin\/meetings$/);
  });

  test("meeting type badge is displayed", async ({ page }) => {
    await page.goto("/admin/meetings/first-meeting-2025");

    // Check for meeting type badge (internal)
    await expect(page.getByText(/internal/i).first()).toBeVisible();
  });

  test("new meeting button exists on list page", async ({ page }) => {
    await page.goto("/admin/meetings");

    // Check for the "New meeting" button
    await expect(
      page.getByRole("link", { name: /new meeting/i })
    ).toBeVisible();
  });

  test("clicking new meeting navigates to form", async ({ page }) => {
    await page.goto("/admin/meetings");

    // Click the new meeting button
    await page.getByRole("link", { name: /new meeting/i }).click();

    // Should navigate to new meeting page
    await expect(page).toHaveURL(/\/admin\/meetings\/new/);
  });
});

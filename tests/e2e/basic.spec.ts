import { test, expect } from '@playwright/test'

test('home page renders hero heading', async ({ page }) => {
  await page.goto('/')
  // Be tolerant to copy updates; assert key phrase is present in the H1.
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Prospectivity Mapping/i)
})

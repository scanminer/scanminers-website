import { test, expect } from '@playwright/test'

test('home page renders hero heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('AI-Powered Mineral Prospectivity Mapping')
})

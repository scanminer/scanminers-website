import { test, expect } from '@playwright/test'

test.describe('Mobile layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }) // iPhone 12 size
  })

  test('no horizontal overflow and safe padding on hero', async ({ page }) => {
    await page.goto('/')

    // Ensure no horizontal scrollbar
    const hasOverflow = await page.evaluate(() => {
      const doc = document.documentElement
      return doc.scrollWidth > doc.clientWidth
    })
    expect(hasOverflow).toBe(false)

    // Check the first H1 is within safe left/right padding bounds (>= 12px margin from edges)
    const h1 = page.getByRole('heading', { level: 1 }).first()
    const box = await h1.boundingBox()
    const viewport = page.viewportSize()!
    expect(box).not.toBeNull()
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(12)
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 12)
    }
  })

  test('mobile menu opens and aligns', async ({ page }) => {
    await page.goto('/')

  // Open mobile menu (ensure the button is ready)
  const openBtn = page.getByRole('button', { name: /open menu/i })
  await expect(openBtn).toBeVisible()
  await openBtn.click()

  // Panel dialog should be visible and contain menu links
  const panel = page.getByRole('dialog', { name: /main menu/i })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('link', { name: 'About', exact: true })).toBeVisible()

    // Approximate alignment: close button should be near the right edge
  const closeBtn = panel.getByRole('button', { name: /close menu/i })
  await expect(closeBtn).toBeVisible()
  const btnBox = await closeBtn.boundingBox()
    const viewport = page.viewportSize()!
    expect(btnBox).not.toBeNull()
    if (btnBox) {
      expect(viewport.width - (btnBox.x + btnBox.width)).toBeLessThanOrEqual(16)
    }

    // Ensure some links are visible within the panel (avoid footer/header collisions)
    await expect(panel.getByRole('link', { name: 'About', exact: true })).toBeVisible()
  await expect(panel.getByRole('link', { name: 'Contact' }).first()).toBeVisible()
  })
})

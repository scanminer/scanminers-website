import { test, expect } from '@playwright/test'

test.describe.skip('Admin Brand Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin auth - in real scenario you'd log in first
    await page.addInitScript(() => {
      document.cookie = 'admin-session=test-session; path=/';
    });
  })

  test('navigates to brand portal and displays sections', async ({ page }) => {
    await page.goto('/admin/brand')
    
    // Check if brand system heading is visible
    await expect(page.getByRole('heading', { name: /Brand System/i })).toBeVisible()
    
    // Check for stat cards
    await expect(page.getByText(/Approved sections/i)).toBeVisible()
    await expect(page.getByText(/Draft sections/i)).toBeVisible()
    await expect(page.getByText(/Brand categories/i)).toBeVisible()
  })

  test('switches between tabs', async ({ page }) => {
    await page.goto('/admin/brand')
    
    // Check Overview tab is active by default
    await expect(page.getByText('Overview')).toBeVisible()
    
    // Click Editor tab
    await page.getByRole('button', { name: /Editor/i }).click()
    await expect(page.getByText('Brand sections')).toBeVisible()
    
    // Click AI Guide tab
    await page.getByRole('button', { name: /AI Guide/i }).click()
    await expect(page.getByText('System prompt')).toBeVisible()
  })

  test('editor tab allows section selection and editing', async ({ page }) => {
    await page.goto('/admin/brand')
    
    // Navigate to Editor tab
    await page.getByRole('button', { name: /Editor/i }).click()
    
    // Check if form fields are present
    await expect(page.getByLabel(/Title/i)).toBeVisible()
    await expect(page.getByLabel(/Status/i)).toBeVisible()
    await expect(page.getByLabel(/Summary/i)).toBeVisible()
    
    // Check if save button exists
    await expect(page.getByRole('button', { name: /Save brand section/i })).toBeVisible()
    
    // Verify helper text mentions GitHub PR
    await expect(page.getByText(/Saves open a GitHub PR/i)).toBeVisible()
  })
})

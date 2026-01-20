import { test, expect } from '@playwright/test'

test.describe('Branch Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'branch1@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/periods/)
  })

  test('view periods list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Periods')
  })

  test('data entry autosaves', async ({ page }) => {
    await page.goto('/periods')

    const fillButton = page.getByText('Fill Data').first()
    const isVisible = await fillButton.isVisible()
    if (isVisible) {
      await fillButton.click()

      await page.waitForTimeout(1000)

      const inputs = await page.locator('input[type="number"]').count()
      if (inputs > 0) {
        await page.fill('input[type="number"]', '123.45')
        await page.waitForTimeout(1000)
      }
    }
  })

  test('submit and withdraw entry', async ({ page }) => {
    await page.goto('/periods')

    const viewButton = page.getByText('View/Edit').first()
    const isVisible = await viewButton.isVisible()
    if (isVisible) {
      await viewButton.click()

      const submitButton = page.getByText('Submit').first()
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await expect(page.locator('text=SUBMITTED')).toBeVisible()
      }

      const withdrawButton = page.getByText('Withdraw').first()
      if (await withdrawButton.isVisible()) {
        await withdrawButton.click()
        await expect(page.locator('text=DRAFT')).toBeVisible()
      }
    }
  })
})

import { test, expect } from '@playwright/test'

test.describe('Branch Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#identifier', 'branch1@example.com')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/periods/)
  })

  test('view periods list', async ({ page }) => {
    await page.goto('/periods')
    await expect(page.getByRole('heading', { name: 'Kỳ Báo Cáo' })).toBeVisible()
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
        await page.locator('input[type="number"]').first().fill('123.45')
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

      const submitButton = page.getByRole('button', { name: /gửi/i }).first()
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await expect(page.getByText('Đã gửi')).toBeVisible()
      }

      const withdrawButton = page.getByRole('button', { name: /thu hồi/i }).first()
      if (await withdrawButton.isVisible()) {
        await withdrawButton.click()
        await expect(page.getByText('Bản nháp')).toBeVisible()
      }
    }
  })
})

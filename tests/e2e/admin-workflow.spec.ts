import { test, expect } from '@playwright/test'

test.describe('Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
  })

  test('view admin dashboard', async ({ page }) => {
    await page.waitForURL(/\/periods/)
    await page.goto('/admin')
    await expect(page.locator('h1')).toContainText('Admin Dashboard')
  })

  test('view templates page', async ({ page }) => {
    await page.waitForURL(/\/periods/)
    await page.goto('/admin/templates')
    await expect(page.locator('h1')).toContainText('Templates')
  })

  test('create template', async ({ page }) => {
    await page.waitForURL(/\/periods/)
    await page.goto('/admin/templates')

    const templateName = `Test Template ${Date.now()}`
    await page.fill('input[name="name"]', templateName)
    await page.click('button[type="submit"]')

    await expect(page.getByText(templateName)).toBeVisible()
  })

  test('view periods page', async ({ page }) => {
    await page.waitForURL(/\/periods/)
    await page.goto('/admin/periods')
    await expect(page.locator('h1')).toContainText('Periods')
  })

  test('create period', async ({ page }) => {
    await page.waitForURL(/\/periods/)
    await page.goto('/admin/periods')

    const periodName = `Q${Math.floor(Math.random() * 4) + 1} 2026`

    const templateSelect = page.locator('select[name="templateId"]')
    await templateSelect.selectOption({ index: 0 })

    await page.fill('input[name="name"]', periodName)
    await page.click('button[type="submit"]')

    await expect(page.getByText(periodName)).toBeVisible()
  })
})

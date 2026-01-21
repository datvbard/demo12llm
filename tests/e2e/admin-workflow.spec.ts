import { test, expect } from '@playwright/test'

test.describe('Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('#identifier', 'admin@example.com')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(periods|admin)/, { timeout: 10000 })
  })

  test('view admin dashboard', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Xin chào, Quản Trị Viên!' })).toBeVisible()
  })

  test('view templates page', async ({ page }) => {
    await page.goto('/admin/templates')
    await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible()
  })

  test('create template', async ({ page }) => {
    await page.goto('/admin/templates')

    const templateName = `Test Template ${Date.now()}`
    await page.fill('input[name="name"]', templateName)
    await page.click('button[type="submit"]')

    await expect(page.getByText(templateName)).toBeVisible()
  })

  test('view periods page', async ({ page }) => {
    await page.goto('/admin/periods')
    await expect(page.getByRole('heading', { name: 'Periods' })).toBeVisible()
  })

  test('create period', async ({ page }) => {
    await page.goto('/admin/periods')

    const periodName = `Q${Math.floor(Math.random() * 4) + 1} 2026`

    const templateSelect = page.locator('select').first()
    await templateSelect.selectOption({ index: 1 })

    await page.fill('input[placeholder*="Period name"]', periodName)
    await page.click('button:has-text("Create Period")')

    await expect(page.getByText(periodName)).toBeVisible()
  })
})

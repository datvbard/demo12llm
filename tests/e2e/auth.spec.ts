import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('admin can login and access admin routes', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('#identifier', 'admin@example.com')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(periods|admin)/, { timeout: 10000 })

    await expect(page).toHaveURL(/\/(periods|admin)/)
    await page.goto('/admin/templates')
    await expect(page).toHaveURL(/\/admin\/templates/)
  })

  test('branch user cannot access admin routes', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('#identifier', 'branch1@example.com')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/periods/, { timeout: 10000 })

    await page.goto('/admin/templates')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/periods')
    await expect(page).toHaveURL(/\/login/)
  })
})

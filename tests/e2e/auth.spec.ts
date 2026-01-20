import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('admin can login and access admin routes', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/periods/)
    await page.goto('/admin/templates')
    await expect(page).toHaveURL(/\/admin\/templates/)
  })

  test('branch user cannot access admin routes', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'branch1@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.goto('/admin/templates')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/periods')
    await expect(page).toHaveURL(/\/login/)
  })
})

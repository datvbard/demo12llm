import { PrismaClient } from '@prisma/client'
import { seedTestData } from './seed'

/**
 * Test setup utilities.
 * Provides database setup helpers for E2E tests.
 */

let prisma: PrismaClient | null = null

/**
 * Get or create Prisma client singleton.
 */
export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

/**
 * Setup test data before running tests.
 * Call this in test fixtures or beforeAll hooks.
 */
export async function setupTestDatabase() {
  await seedTestData()
}

/**
 * Cleanup test data after tests.
 * Optionally call in afterAll hooks for clean state.
 * IMPORTANT: Delete in correct order to respect foreign key constraints.
 */
export async function cleanupTestDatabase() {
  const prisma = getPrisma()

  // Delete in order: children before parents (respect FK constraints)
  // 1. Entry values (children of entries)
  await prisma.entryValue.deleteMany({
    where: {
      entry: { period: { id: { startsWith: 'test-' } } }
    }
  })

  // 2. Entries (children of periods)
  await prisma.entry.deleteMany({
    where: {
      period: { id: { startsWith: 'test-' } }
    }
  })

  // 3. Period fields (children of templates)
  await prisma.templateField.deleteMany({
    where: {
      template: { id: { startsWith: 'test-' } }
    }
  })

  // 4. Periods
  await prisma.period.deleteMany({
    where: { id: { startsWith: 'test-' } }
  })

  // 5. Templates
  await prisma.template.deleteMany({
    where: { id: { startsWith: 'test-' } }
  })

  // 6. Users (must delete before branch due to FK)
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@example.com', 'branch1@example.com']
      }
    }
  })

  // 7. Branches
  await prisma.branch.deleteMany({
    where: { id: { startsWith: 'test-' } }
  })
}

/**
 * Cleanup and disconnect Prisma.
 */
export async function teardownTestDatabase() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

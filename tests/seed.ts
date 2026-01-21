import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Seed test data for E2E tests.
 * Uses upsert so tests can be run multiple times safely.
 */

export async function seedTestData() {
  console.log('Seeding test data...')

  // Create or update test admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Test Admin',
      role: 'ADMIN',
    },
  })
  console.log('✓ Test admin user:', admin.email)

  // Find or create test branch
  const branch = await prisma.branch.upsert({
    where: { id: 'test-branch-001' },
    update: {},
    create: {
      id: 'test-branch-001',
      name: 'Chi nhánh Test',
    },
  })
  console.log('✓ Test branch:', branch.name)

  // Create or update test branch user
  const branchUser = await prisma.user.upsert({
    where: { email: 'branch1@example.com' },
    update: {},
    create: {
      email: 'branch1@example.com',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Test Branch User',
      role: 'BRANCH',
      branchId: branch.id,
    },
  })
  console.log('✓ Test branch user:', branchUser.email)

  // Create a test template first
  const template = await prisma.template.upsert({
    where: { id: 'test-template-001' },
    update: {},
    create: {
      id: 'test-template-001',
      name: 'Mẫu Báo Cáo Test',
      createdBy: admin.id,
    },
  })
  console.log('✓ Test template:', template.name)

  // Create a test period
  const period = await prisma.period.upsert({
    where: { id: 'test-period-001' },
    update: {},
    create: {
      id: 'test-period-001',
      name: 'Tháng 1/2026',
      templateId: template.id,
      status: 'OPEN',
    },
  })
  console.log('✓ Test period:', period.name)

  console.log('Test data seeded successfully!')
}

/**
 * Main entry point for running seeds directly.
 */
async function main() {
  try {
    await seedTestData()
  } catch (error) {
    console.error('Error seeding test data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

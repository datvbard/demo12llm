/**
 * Cached database queries using React.cache().
 * Provides automatic request deduplication during React rendering.
 */

import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Get all templates with their fields (cached).
 */
export const getTemplates = cache(async () => {
  return prisma.template.findMany({
    include: { fields: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get a single template by ID with fields (cached).
 */
export const getTemplateById = cache(async (id: string) => {
  return prisma.template.findUnique({
    where: { id },
    include: { fields: { orderBy: { order: 'asc' } } },
  })
})

/**
 * Get all periods with template and entry counts (cached).
 */
export const getPeriods = cache(async () => {
  return prisma.period.findMany({
    include: {
      template: { select: { name: true } },
      _count: { select: { entries: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get a single period by ID with full details (cached).
 */
export const getPeriodById = cache(async (id: string) => {
  return prisma.period.findUnique({
    where: { id },
    include: {
      template: {
        include: { fields: { orderBy: { order: 'asc' } } },
      },
    },
  })
})

/**
 * Get all branches (cached).
 */
export const getBranches = cache(async () => {
  return prisma.branch.findMany({
    orderBy: { name: 'asc' },
  })
})

/**
 * Get all users with branch info (cached).
 */
export const getUsers = cache(async () => {
  return prisma.user.findMany({
    include: { branch: true },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get customer report by ID with full details (cached).
 */
export const getCustomerReportById = cache(async (id: string) => {
  return prisma.customerReport.findUnique({
    where: { id },
    include: {
      template: { include: { fields: { orderBy: { order: 'asc' } } } },
      rows: {
        include: { responses: true },
        orderBy: { rowIndex: 'asc' },
      },
    },
  })
})

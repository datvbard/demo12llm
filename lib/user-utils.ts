import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

function parsePaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.limit || DEFAULT_PAGE_SIZE)
  )
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export interface CreateUserData {
  email: string
  username: string
  password: string
  branchId?: string
  fullName?: string
  position?: string
}

export interface UpdatePasswordData {
  userId: string
  newPassword: string
}

export async function getAllUsers() {
  return prisma.user.findMany({
    include: { branch: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { branch: true },
  })
}

export async function getUserByEmailOrUsername(identifier: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  })
}

export async function createUser(data: CreateUserData) {
  const hashedPassword = await bcrypt.hash(data.password, 10)

  return prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      password: hashedPassword,
      role: Role.BRANCH,
      branchId: data.branchId,
      fullName: data.fullName || null,
      position: data.position || null,
    },
    include: { branch: true },
  })
}

export async function updateUserPassword(data: UpdatePasswordData) {
  const hashedPassword = await bcrypt.hash(data.newPassword, 10)

  return prisma.user.update({
    where: { id: data.userId },
    data: { password: hashedPassword },
  })
}

export async function isUsernameAvailable(username: string, excludeUserId?: string) {
  const existing = await prisma.user.findUnique({
    where: { username },
  })

  if (!existing) return true
  if (excludeUserId && existing.id === excludeUserId) return true
  return false
}

export async function isEmailAvailable(email: string, excludeUserId?: string) {
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (!existing) return true
  if (excludeUserId && existing.id === excludeUserId) return true
  return false
}

export async function getBranchUsers(params?: PaginationParams): Promise<PaginatedResponse<any>> {
  const { page, limit, skip } = parsePaginationParams(params || {})

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.BRANCH },
      include: { branch: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { role: Role.BRANCH } }),
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function getBranches(params?: PaginationParams): Promise<PaginatedResponse<any>> {
  const { page, limit, skip } = parsePaginationParams(params || {})

  const [data, total] = await Promise.all([
    prisma.branch.findMany({
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { users: true },
        },
      },
    }),
    prisma.branch.count(),
  ])

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

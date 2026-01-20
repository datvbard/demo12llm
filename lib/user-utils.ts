import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export interface CreateUserData {
  email: string
  username: string
  password: string
  branchId?: string
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

export async function getBranchUsers() {
  return prisma.user.findMany({
    where: { role: Role.BRANCH },
    include: { branch: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getBranches() {
  return prisma.branch.findMany({
    orderBy: { name: 'asc' },
  })
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }
  return user
}

export async function requireBranch() {
  const user = await getCurrentUser()
  if (!user) {
    console.log('[requireBranch] No user found in session')
    throw new Error('Not authenticated')
  }
  if (user.role !== 'BRANCH') {
    console.log('[requireBranch] User is not BRANCH:', user.role)
    throw new Error('Must be a branch user')
  }
  if (!user.branchId) {
    console.log('[requireBranch] User has no branchId')
    throw new Error('User has no branch assigned')
  }
  return user
}

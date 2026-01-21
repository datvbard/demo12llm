import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server-auth'
import { getBranchUsers, createUser, isUsernameAvailable, isEmailAvailable, getBranches } from '@/lib/user-utils'
import { Role } from '@prisma/client'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE), 10)))

    const users = await getBranchUsers({ page, limit })
    return NextResponse.json(users)
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/users', 'Failed to get users')
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const { email, username, password, branchId } = await req.json()

    if (!email || !username || !password || !branchId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const usernameOk = await isUsernameAvailable(username)
    if (!usernameOk) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    const emailOk = await isEmailAvailable(email)
    if (!emailOk) {
      return NextResponse.json({ error: 'Email already taken' }, { status: 400 })
    }

    const user = await createUser({ email, username, password, branchId })
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/users', 'Failed to create user')
  }
}

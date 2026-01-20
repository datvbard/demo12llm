import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server-auth'
import { getBranchUsers, createUser, isUsernameAvailable, isEmailAvailable, getBranches } from '@/lib/user-utils'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    await requireAdmin()
    const users = await getBranchUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    console.error('Create user error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

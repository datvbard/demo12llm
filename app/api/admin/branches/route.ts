import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server-auth'
import { getBranches } from '@/lib/user-utils'
import { handleApiError } from '@/lib/api-error-handler'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE), 10)))

    const branches = await getBranches({ page, limit })
    return NextResponse.json(branches)
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/branches', 'Failed to get branches')
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const { name } = await req.json()

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    // Check if branch already exists
    const existing = await prisma.branch.findUnique({
      where: { name: trimmedName },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Branch with this name already exists' },
        { status: 400 }
      )
    }

    const branch = await prisma.branch.create({
      data: { name: trimmedName },
      include: {
        _count: { select: { users: true } },
      },
    })

    return NextResponse.json(branch, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/branches', 'Failed to create branch')
  }
}

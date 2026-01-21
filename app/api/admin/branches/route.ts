import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server-auth'
import { getBranches } from '@/lib/user-utils'
import { handleApiError } from '@/lib/api-error-handler'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'

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

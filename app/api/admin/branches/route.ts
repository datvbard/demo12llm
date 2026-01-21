import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server-auth'
import { getBranches } from '@/lib/user-utils'
import { handleApiError } from '@/lib/api-error-handler'

export async function GET() {
  try {
    await requireAdmin()
    const branches = await getBranches()
    return NextResponse.json(branches)
  } catch (error) {
    return handleApiError(error, 'GET /api/admin/branches', 'Failed to get branches')
  }
}

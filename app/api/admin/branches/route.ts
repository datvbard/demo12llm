import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/server-auth'
import { getBranches } from '@/lib/user-utils'

export async function GET() {
  try {
    await requireAdmin()
    const branches = await getBranches()
    return NextResponse.json(branches)
  } catch (error) {
    console.error('Get branches error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

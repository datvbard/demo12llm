import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const entry = await prisma.entry.findUnique({ where: { id } })

    if (!entry || entry.status !== 'LOCKED') {
      return NextResponse.json(
        { error: 'Entry is not locked' },
        { status: 400 }
      )
    }

    await prisma.entry.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'POST /api/admin/entries/[id]/unlock', 'Failed to unlock entry')
  }
}

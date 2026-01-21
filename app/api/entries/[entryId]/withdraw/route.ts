import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-error-handler'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const user = await requireBranch()
    const { entryId } = await params

    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
    })

    if (!entry || entry.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (entry.status === 'LOCKED') {
      return NextResponse.json(
        { error: 'Cannot withdraw locked entry' },
        { status: 400 }
      )
    }

    await prisma.entry.update({
      where: { id: entryId },
      data: {
        status: 'DRAFT',
        submittedAt: null,
        submittedBy: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'POST /api/entries/[entryId]/withdraw', 'Failed to withdraw entry')
  }
}

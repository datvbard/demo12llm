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
      include: {
        period: {
          include: {
            template: {
              include: { fields: true },
            },
          },
        },
      },
    })

    if (!entry || entry.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (entry.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 })
    }

    const values = await prisma.entryValue.findMany({
      where: { entryId },
    })

    const valueMap = new Map(values.map((v) => [v.templateFieldId, v.value]))
    const missing = entry.period.template.fields.some(
      (f) => !f.formula && !valueMap.has(f.id)
    )

    if (missing) {
      return NextResponse.json(
        { error: 'Missing required values' },
        { status: 400 }
      )
    }

    await prisma.entry.update({
      where: { id: entryId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submittedBy: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'POST /api/entries/[entryId]/submit', 'Failed to submit entry')
  }
}

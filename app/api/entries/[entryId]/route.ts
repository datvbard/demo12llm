import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { handleApiError, validationError } from '@/lib/api-error-handler'
import { validateID } from '@/lib/validation'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const user = await requireBranch()
    const { entryId } = await params
    const { templateFieldId, value } = await req.json()

    // Validate IDs
    if (!validateID(entryId)) {
      return validationError('Invalid entry ID')
    }
    if (!validateID(templateFieldId)) {
      return validationError('Invalid template field ID')
    }

    // Check entry ownership and period status
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      include: { period: true },
    })

    if (!entry || entry.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (entry.period.status !== 'OPEN' || entry.status === 'LOCKED') {
      return NextResponse.json({ error: 'Period locked' }, { status: 400 })
    }

    // Use transaction to prevent race condition
    await prisma.$transaction([
      prisma.entryValue.upsert({
        where: {
          entryId_templateFieldId: {
            entryId,
            templateFieldId,
          },
        },
        create: {
          entryId,
          templateFieldId,
          value,
        },
        update: { value },
      }),
      prisma.entry.update({
        where: { id: entryId },
        data: { updatedAt: new Date() },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'PATCH /api/entries/[entryId]', 'Failed to update entry')
  }
}

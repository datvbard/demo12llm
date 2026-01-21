import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { reorderFieldsSchema } from '@/lib/validations/customer-report'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const body = await req.json()
    const { fieldIds } = reorderFieldsSchema.parse(body)

    // Verify all fields belong to template
    const fields = await prisma.reportResponseField.findMany({
      where: { templateId: id, id: { in: fieldIds } },
      select: { id: true },
    })

    if (fields.length !== fieldIds.length) {
      return NextResponse.json(
        { error: 'One or more fields not found in this template' },
        { status: 400 }
      )
    }

    // Update order for each field
    await prisma.$transaction(
      fieldIds.map((fieldId, index) =>
        prisma.reportResponseField.update({
          where: { id: fieldId },
          data: { order: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[PATCH /api/admin/report-templates/[id]/fields/reorder]', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to reorder fields' },
      { status: 500 }
    )
  }
}

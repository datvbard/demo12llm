import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { updateFieldSchema } from '@/lib/validations/customer-report'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    await requireAdmin()

    const { id, fieldId } = await params
    // Verify field belongs to template
    const field = await prisma.reportResponseField.findFirst({
      where: { id: fieldId, templateId: id },
    })

    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const validatedData = updateFieldSchema.parse(body)

    const updated = await prisma.reportResponseField.update({
      where: { id: fieldId },
      data: validatedData,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('[PATCH /api/admin/report-templates/[id]/fields/[fieldId]]', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update field' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    await requireAdmin()

    const { id, fieldId } = await params
    // Verify field belongs to template
    const field = await prisma.reportResponseField.findFirst({
      where: { id: fieldId, templateId: id },
    })

    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      )
    }

    await prisma.reportResponseField.delete({
      where: { id: fieldId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE /api/admin/report-templates/[id]/fields/[fieldId]]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete field' },
      { status: 500 }
    )
  }
}

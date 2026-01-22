import { requireAdmin } from '@/lib/server-auth'
import { handleApiError } from '@/lib/api-error-handler'
import { prisma } from '@/lib/prisma'
import { updateFieldSchema } from '@/lib/validations/customer-report'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

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
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return handleApiError(error, '[PATCH /api/admin/report-templates/[id]/fields/[fieldId]]', 'Failed to update field')
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
  } catch (error) {
    return handleApiError(error, '[DELETE /api/admin/report-templates/[id]/fields/[fieldId]]', 'Failed to delete field')
  }
}

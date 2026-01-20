import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const fields = await prisma.templateField.findMany({
    where: { templateId: id },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(fields)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  const { label, key, formula } = await req.json()
  const { id } = await params

  if (!label || !key) {
    return NextResponse.json({ error: 'Label and key are required' }, { status: 400 })
  }

  const max = await prisma.templateField.findFirst({
    where: { templateId: id },
    orderBy: { order: 'desc' },
  })

  const field = await prisma.templateField.create({
    data: {
      templateId: id,
      label,
      key: key.toLowerCase(),
      formula: formula || null,
      order: (max?.order ?? -1) + 1,
    },
  })

  return NextResponse.json(field)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { fields } = await req.json()

  await prisma.$transaction(
    fields.map((f: { id: string; order: number }) =>
      prisma.templateField.update({
        where: { id: f.id },
        data: { order: f.order },
      })
    )
  )

  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { searchParams } = new URL(req.url)
  const fieldId = searchParams.get('fieldId')

  if (!fieldId) {
    return NextResponse.json({ error: 'fieldId is required' }, { status: 400 })
  }

  await prisma.templateField.delete({
    where: { id: fieldId },
  })

  return NextResponse.json({ success: true })
}

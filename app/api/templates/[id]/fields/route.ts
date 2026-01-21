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
    include: {
      parent: true,
      children: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(fields)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  const { label, key, formula, parentId } = await req.json()
  const { id } = await params

  if (!label) {
    return NextResponse.json({ error: 'Label is required' }, { status: 400 })
  }

  // If parentId is provided, this is a child field - key is required
  // If parentId is null, this is a parent field (section) - key can be null
  if (parentId && !key) {
    return NextResponse.json({ error: 'Key is required for child fields' }, { status: 400 })
  }

  const max = await prisma.templateField.findFirst({
    where: { templateId: id },
    orderBy: { order: 'desc' },
  })

  const field = await prisma.templateField.create({
    data: {
      templateId: id,
      label,
      key: key ? key.toLowerCase() : null,
      formula: formula || null,
      parentId: parentId || null,
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

  // Check if field has children
  const childCount = await prisma.templateField.count({
    where: { parentId: fieldId },
  })

  if (childCount > 0) {
    return NextResponse.json(
      { error: 'Cannot delete field with child fields. Delete children first.' },
      { status: 400 }
    )
  }

  await prisma.templateField.delete({
    where: { id: fieldId },
  })

  return NextResponse.json({ success: true })
}

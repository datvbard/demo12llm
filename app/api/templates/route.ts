import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireAdmin()
    const templates = await prisma.template.findMany({
      include: { _count: { select: { fields: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(templates)
  } catch (error: any) {
    console.error('[GET /api/templates]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get templates' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin()

    const formData = await req.formData()
    const name = formData.get('name') as string

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const template = await prisma.template.create({
      data: { name, createdBy: user.id },
    })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error('[POST /api/templates]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}

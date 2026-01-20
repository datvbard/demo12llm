import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params

  const period = await prisma.period.findUnique({
    where: { id },
    include: {
      template: {
        include: {
          fields: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  return NextResponse.json(period?.template.fields ?? [])
}

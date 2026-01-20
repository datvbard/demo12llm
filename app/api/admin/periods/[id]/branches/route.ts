import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params

  const branches = await prisma.branch.findMany({
    include: {
      entries: {
        where: { periodId: id },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(branches)
}

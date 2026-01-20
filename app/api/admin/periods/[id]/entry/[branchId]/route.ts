import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
  await requireAdmin()
  const { id, branchId } = await params

  const entry = await prisma.entry.findUnique({
    where: {
      periodId_branchId: {
        periodId: id,
        branchId: branchId,
      },
    },
    include: {
      values: {
        include: {
          templateField: true,
        },
      },
    },
  })

  return NextResponse.json(entry)
}

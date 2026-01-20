import { requireBranch } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const user = await requireBranch()
  const { entryId } = await params
  const { templateFieldId, value } = await req.json()

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

  await prisma.entryValue.upsert({
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
  })

  await prisma.entry.update({
    where: { id: entryId },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}

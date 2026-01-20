import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin()
  const { id } = await params

  const entry = await prisma.entry.findUnique({
    where: { id },
  })

  if (!entry || entry.status !== 'SUBMITTED') {
    return NextResponse.json(
      { error: 'Invalid entry status' },
      { status: 400 }
    )
  }

  await prisma.entry.update({
    where: { id },
    data: {
      status: 'LOCKED',
      confirmedAt: new Date(),
      confirmedBy: user.id,
    },
  })

  return NextResponse.json({ success: true })
}

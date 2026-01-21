import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
  } catch (error) {
    console.error('[POST /api/admin/entries/[id]/confirm]', error)

    // Handle authentication errors specifically
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } }
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to confirm entry' },
      { status: 500 }
    )
  }
}

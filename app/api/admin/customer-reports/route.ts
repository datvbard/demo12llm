import { requireAdmin } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import { createCustomerReportSchema } from '@/lib/validations/customer-report'
import { parseExcelFile, mapBranchNamesToIds, validateFileSize } from '@/lib/excel-parser'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const templateId = searchParams.get('templateId')
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (status) where.status = status
    if (templateId) where.templateId = templateId
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const [reports, total] = await Promise.all([
      prisma.customerReport.findMany({
        where,
        include: {
          template: { select: { name: true } },
          _count: { select: { rows: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customerReport.count({ where }),
    ])

    return NextResponse.json({
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error('[GET /api/admin/customer-reports]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get customer reports' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const formData = await req.formData()
    const name = formData.get('name') as string
    const templateId = formData.get('templateId') as string
    const branchColumn = formData.get('branchColumn') as string
    const file = formData.get('file') as File | null

    // Validate required fields
    if (!name || !templateId || !branchColumn || !file) {
      return NextResponse.json(
        { error: 'name, templateId, branchColumn, and file are required' },
        { status: 400 }
      )
    }

    // Validate template exists
    const template = await prisma.reportTemplate.findUnique({
      where: { id: templateId },
      include: { fields: true },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Report template not found' },
        { status: 404 }
      )
    }

    // Validate file size (10MB)
    const buffer = Buffer.from(await file.arrayBuffer())
    validateFileSize(buffer, 10)

    // Parse Excel file
    const parsedData = await parseExcelFile(buffer, branchColumn)

    // Map branch names to IDs
    const branchNames = parsedData.rows
      .map(r => r.branchName)
      .filter((n): n is string => Boolean(n))

    const branchMap = await mapBranchNamesToIds(branchNames)

    // Check for unmapped branches
    const unmappedBranches = Array.from(branchMap.entries())
      .filter(([_, id]) => id === null)
      .map(([name]) => name)

    if (unmappedBranches.length > 0) {
      return NextResponse.json(
        {
          error: 'Some branches in Excel not found in system',
          unmappedBranches,
        },
        { status: 400 }
      )
    }

    // Create report with rows in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create report
      const report = await tx.customerReport.create({
        data: {
          name,
          templateId,
          branchColumn,
          columns: parsedData.headers.map(h => ({
            key: h.toLowerCase().replace(/\s+/g, '_'),
            label: h,
            type: 'string' as const,
          })),
          uploadedBy: (await requireAdmin()).id,
          status: 'OPEN',
        },
      })

      // Create rows
      const rows = await Promise.all(
        parsedData.rows.map((row) =>
          tx.customerRow.create({
            data: {
              reportId: report.id,
              branchId: branchMap.get(row.branchName || '') || null,
              rowIndex: row.rowIndex,
              customerData: row.data,
            },
          })
        )
      )

      return { report, rowCount: rows.length }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('[POST /api/admin/customer-reports]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create customer report' },
      { status: 500 }
    )
  }
}

import ExcelJS from 'exceljs'
import { prisma } from './prisma'

export interface ParsedExcelRow {
  rowIndex: number
  data: Record<string, string | number | boolean | null>
  branchName?: string
}

export interface ParsedExcelResult {
  headers: string[]
  rows: ParsedExcelRow[]
  totalRows: number
}

/**
 * Parse Excel file and extract data
 * @param buffer Excel file buffer
 * @param branchColumn Column name containing branch names
 * @returns Parsed data with headers and rows
 */
export async function parseExcelFile(
  buffer: Buffer,
  branchColumn: string
): Promise<ParsedExcelResult> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as any)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) {
    throw new Error('Excel file is empty')
  }

  // Get headers from first row
  const headerRow = worksheet.getRow(1)
  const headers: string[] = []
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.text?.trim() || `column_${colNumber}`
  })

  // Validate branch column exists
  if (!headers.includes(branchColumn)) {
    throw new Error(`Branch column "${branchColumn}" not found in Excel headers`)
  }

  // Parse data rows
  const rows: ParsedExcelRow[] = []
  const branchIndex = headers.indexOf(branchColumn)

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // Skip header row

    const rowData: Record<string, string | number | boolean | null> = {}
    let branchName: string | undefined

    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1]
      let value: string | number | boolean | null = cell.text

      // Try to convert to number if possible
      if (cell.type === ExcelJS.ValueType.Number) {
        value = cell.value as number
      }

      rowData[header] = value

      // Extract branch name
      if (colNumber - 1 === branchIndex) {
        branchName = String(value).trim()
      }
    })

    // Skip empty rows
    if (Object.values(rowData).some(v => v !== null && v !== '')) {
      rows.push({
        rowIndex: rowNumber - 1, // 0-based index for database
        data: rowData,
        branchName,
      })
    }
  })

  return {
    headers,
    rows,
    totalRows: rows.length,
  }
}

/**
 * Map branch names to IDs using exact match
 * @param branchNames Array of branch names to map
 * @returns Map of branch name to branch ID
 */
export async function mapBranchNamesToIds(
  branchNames: string[]
): Promise<Map<string, string | null>> {
  // Get all branches
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true },
  })

  const branchMap = new Map<string, string>()
  branches.forEach(b => branchMap.set(b.name.toLowerCase(), b.id))

  const result = new Map<string, string | null>()

  for (const name of branchNames) {
    const matchedId = branchMap.get(name.toLowerCase())
    result.set(name, matchedId || null)
  }

  return result
}

/**
 * Validate file size
 * @param buffer File buffer
 * @param maxSizeMB Max size in megabytes
 * @throws Error if file is too large
 */
export function validateFileSize(buffer: Buffer, maxSizeMB: number = 10): void {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (buffer.length > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`)
  }
}

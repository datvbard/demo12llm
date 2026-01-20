import ExcelJS from 'exceljs'

interface Column {
  header: string
  key: string
  width?: number
}

interface Row {
  [key: string]: string | number
}

export async function generateExcel(
  columns: Column[],
  data: Row[],
  sheetName: string = 'Sheet1'
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  worksheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 15,
  }))

  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  }

  data.forEach((row) => worksheet.addRow(row))

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer as ArrayBuffer)
}

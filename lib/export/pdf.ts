import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Column {
  header: string
  dataKey: string
}

interface Row {
  [key: string]: string | number
}

export function generatePDF(
  title: string,
  columns: Column[],
  data: Row[]
): Buffer {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text(title, 14, 15)

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.header)],
    body: data.map((row) =>
      columns.map((c) => (row[c.dataKey] !== undefined ? String(row[c.dataKey]) : ''))
    ),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] },
  })

  return Buffer.from(doc.output('arraybuffer'))
}

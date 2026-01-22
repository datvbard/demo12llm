const ExcelJS = require('exceljs');

async function createExcelFromBranches(branches) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('KhachHang');

  // Define columns
  worksheet.columns = [
    { header: 'ho_ten', key: 'ho_ten', width: 25 },
    { header: 'so_dien_thoai', key: 'so_dien_thoai', width: 15 },
    { header: 'chi_nhanh', key: 'chi_nhanh', width: 20 },
    { header: 'dia_chi', key: 'dia_chi', width: 30 },
    { header: 'nguon_khach', key: 'nguon_khach', width: 15 },
    { header: 'ghi_chu', key: 'ghi_chu', width: 30 },
  ];

  // Generate sample data for each branch
  let rowNumber = 1;
  for (const branch of branches) {
    const samples = [
      ['Nguyễn Văn A' + rowNumber, '090' + String(rowNumber).padStart(7, '0'), branch, 'Địa chỉ mẫu', 'Facebook', 'Khách mới'],
      ['Trần Thị B' + rowNumber, '091' + String(rowNumber).padStart(7, '0'), branch, 'Địa chỉ mẫu', 'Website', 'Đã tư vấn'],
    ];
    samples.forEach(row => worksheet.addRow(row));
    rowNumber++;
  }

  // Style header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };

  await workbook.xlsx.writeFile('khach-hang-theo-branches.xlsx');
  console.log('✅ Created: khach-hang-theo-branches.xlsx');
  console.log('📊 Branches:', branches.join(', '));
}

// Usage: node scripts/create-excel-from-branches.js "Branch 1,Branch 2,Branch 3"
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/create-excel-from-branches.js "Branch 1,Branch 2,..."');
  console.log('Example: node scripts/create-excel-from-branches.js "CN Hà Nội,CN HCM,CN Đà Nẵng"');
  process.exit(1);
}

const branches = args[0].split(',').map(b => b.trim());
createExcelFromBranches(branches).catch(console.error);

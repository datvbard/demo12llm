const ExcelJS = require('exceljs');

async function createDemoExcel() {
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

  // Sample data
  const sampleData = [
    ['Nguyễn Văn An', '0901234567', 'CN Hà Nội', 'Đống Đa, Hà Nội', 'Facebook', 'Khách tiềm năng'],
    ['Trần Thị Bình', '0912345678', 'CN Hà Nội', 'Cầu Giấy, Hà Nội', 'Website', 'Đã mua SP'],
    ['Lê Văn Cường', '0923456789', 'CN HCM', 'Quận 1, TP.HCM', 'Giới thiệu', 'VIP'],
    ['Phạm Thị Dung', '0934567890', 'CN HCM', 'Quận 3, TP.HCM', 'Tiktok', 'Mới'],
    ['Hoàng Văn Em', '0945678901', 'CN Đà Nẵng', 'Hải Châu, Đà Nẵng', 'Facebook', 'Đang quan tâm'],
    ['Vũ Thị Hoa', '0956789012', 'CN Đà Nẵng', 'Thanh Khê, Đà Nẵng', 'Google', 'Đã tư vấn'],
    ['Ngô Văn Ích', '0967890123', 'CN Hà Nội', 'Hà Đông, Hà Nội', 'Bạn bè', 'Hẹn gọi lại'],
    ['Đỗ Thị Khanh', '0978901234', 'CN HCM', 'Quận 5, TP.HCM', 'Facebook', 'Khách lẻ'],
  ];

  // Add rows
  sampleData.forEach(row => {
    worksheet.addRow(row);
  });

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add a note sheet
  const noteSheet = workbook.addWorksheet('HuongDan');
  noteSheet.mergeCells('A1:D1');
  const titleCell = noteSheet.getCell('A1');
  titleCell.value = 'HƯỚNG DẪN SỬ DỤNG FILE DEMO';
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  const instructions = [
    ['', ''],
    ['1. Cấu trúc file:', '- Dòng 1: Tiêu đề cột (bắt buộc)'],
    ['', '- Dòng 2+: Dữ liệu khách hàng'],
    ['', '- Cột "chi_nhanh" phải khớp với tên trong hệ thống'],
    [''],
    ['2. Các cột bắt buộc:', '- chi_nhanh: Tên chi nhánh (CN Hà Nội, CN HCM, CN Đà Nẵng)'],
    [''],
    ['3. Các cột tùy chọn:', '- ho_ten, so_dien_thoai, dia_chi, nguon_khach, ghi_chu'],
    [''],
    ['4. Lưu ý:', '- File định dạng .xlsx'],
    ['', '- Kích thước tối đa 10MB'],
    ['', '- Tên chi nhánh phải chính xác (phân biệt hoa thường)'],
  ];

  instructions.forEach((row, index) => {
    noteSheet.addRow(row);
    if (index === 0 || row[0].includes('Cấu trúc') || row[0].includes('các')) {
      noteSheet.getRow(index + 3).font = { bold: true };
    }
  });

  noteSheet.getColumn('A').width = 25;
  noteSheet.getColumn('B').width = 50;

  // Save file
  await workbook.xlsx.writeFile('demo-khach-hang.xlsx');
  console.log('✅ File demo đã tạo: demo-khach-hang.xlsx');
  console.log('📊 Số lượng mẫu:', sampleData.length, 'khách hàng');
  console.log('🏢 Các chi nhánh:', [...new Set(sampleData.map(r => r[2]))].join(', '));
}

createDemoExcel().catch(console.error);

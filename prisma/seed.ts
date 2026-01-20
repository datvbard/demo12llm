import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Branch data with Vietnamese names
const BRANCHES = [
  "Hội sở",
  "Quang Trung",
  "Nam Duyên Hải",
  "Cầu Kè",
  "Tiểu Cần",
  "Lê Lợi",
  "Trà Cú",
  "Cầu Ngang",
  "Châu Thành",
  "Duyên Hải",
  "Càng Long",
];

// Branch user data: username, email, fullName, position, branchName
const BRANCH_USERS = [
  { username: "hoiso", email: "hoiso@example.com", fullName: "Nguyễn Văn A", position: "Quản lý", branchName: "Hội sở" },
  { username: "quangtrung", email: "quangtrung@example.com", fullName: "Trần Văn B", position: "Nhân viên", branchName: "Quang Trung" },
  { username: "namduyenhai", email: "namduyenhai@example.com", fullName: "Lê Văn C", position: "Nhân viên", branchName: "Nam Duyên Hải" },
  { username: "cauke", email: "cauke@example.com", fullName: "Phạm Văn D", position: "Nhân viên", branchName: "Cầu Kè" },
  { username: "tieucan", email: "tieucan@example.com", fullName: "Hoàng Văn E", position: "Nhân viên", branchName: "Tiểu Cần" },
  { username: "leloi", email: "leloi@example.com", fullName: "Ngô Văn F", position: "Nhân viên", branchName: "Lê Lợi" },
  { username: "tracu", email: "tracu@example.com", fullName: "Võ Văn G", position: "Nhân viên", branchName: "Trà Cú" },
  { username: "caungang", email: "caungang@example.com", fullName: "Đặng Văn H", position: "Nhân viên", branchName: "Cầu Ngang" },
  { username: "chauthanh", email: "chauthanh@example.com", fullName: "Lý Văn I", position: "Nhân viên", branchName: "Châu Thành" },
  { username: "duyenhai", email: "duyenhai@example.com", fullName: "Phan Văn K", position: "Nhân viên", branchName: "Duyên Hải" },
  { username: "canglong", email: "canglong@example.com", fullName: "Huỳnh Văn L", position: "Nhân viên", branchName: "Càng Long" },
];

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Delete old entries
  await prisma.entryValue.deleteMany({});
  await prisma.entry.deleteMany({});
  console.log("✓ Deleted old entries");

  // Delete old branch users (keep admins)
  await prisma.user.deleteMany({
    where: { role: Role.BRANCH },
  });
  console.log("✓ Deleted old branch users");

  // Delete old branches
  await prisma.branch.deleteMany({});
  console.log("✓ Deleted old branches");

  // Create admin user "quantrivba"
  await prisma.user.upsert({
    where: { email: "quantrivba@example.com" },
    update: { username: "quantrivba", fullName: "Quản Trị VBA", position: "Admin" },
    create: {
      email: "quantrivba@example.com",
      username: "quantrivba",
      password: hashedPassword,
      fullName: "Quản Trị VBA",
      position: "Admin",
      role: Role.ADMIN,
    },
  });
  console.log("✓ Admin user created: quantrivba / password123");

  // Create branches and branch users
  for (const branchName of BRANCHES) {
    const branch = await prisma.branch.create({
      data: { name: branchName },
    });
    console.log(`✓ Branch created: ${branchName}`);
  }

  for (const userData of BRANCH_USERS) {
    const branch = await prisma.branch.findUnique({
      where: { name: userData.branchName },
    });

    if (branch) {
      await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          fullName: userData.fullName,
          position: userData.position,
          role: Role.BRANCH,
          branchId: branch.id,
        },
      });
      console.log(`✓ User created: ${userData.username} (${userData.fullName}) - ${userData.branchName}`);
    }
  }

  // Create template with fields
  const template = await prisma.template.upsert({
    where: { name: "Monthly Report" },
    update: {},
    create: {
      name: "Monthly Report",
      createdBy: "quantrivba@example.com",
    },
  });

  // Clear existing fields and recreate
  await prisma.templateField.deleteMany({
    where: { templateId: template.id },
  });

  const fields = [
    { key: "A", label: "Revenue", order: 1 },
    { key: "B", label: "Expenses", order: 2 },
    { key: "C", label: "Profit", order: 3, formula: "A - B" },
    { key: "D", label: "Profit Margin", order: 4, formula: "(A - B) / A" },
  ];

  for (const field of fields) {
    await prisma.templateField.create({
      data: {
        templateId: template.id,
        ...field,
      },
    });
  }

  console.log(`✓ Template created: ${template.name} with ${fields.length} fields`);

  // Check if period exists, if not create
  let period = await prisma.period.findFirst({
    where: { name: "January 2025" },
  });

  if (!period) {
    period = await prisma.period.create({
      data: {
        name: "January 2025",
        templateId: template.id,
        status: "OPEN",
      },
    });
    console.log(`✓ Period created: ${period.name}`);
  } else {
    console.log(`✓ Period already exists: ${period.name}`);
  }

  // Create empty entries for all branches
  const branches = await prisma.branch.findMany();
  for (const branch of branches) {
    const existingEntry = await prisma.entry.findUnique({
      where: {
        periodId_branchId: {
          periodId: period.id,
          branchId: branch.id,
        },
      },
    });

    if (!existingEntry) {
      await prisma.entry.create({
        data: {
          periodId: period.id,
          branchId: branch.id,
          status: "DRAFT",
        },
      });
    }
  }

  console.log(`✓ Created empty entries for all branches`);

  console.log("\n✓ Seed completed!");
  console.log("\nTest accounts:");
  console.log("  Admin:     quantrivba / password123");
  console.log("  Branch users:");
  for (const user of BRANCH_USERS) {
    console.log(`    ${user.username} / password123 (${user.fullName} - ${user.branchName})`);
  }
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

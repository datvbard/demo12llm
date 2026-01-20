import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log("✓ Admin user created: admin@example.com / password123");

  // Create 11 branches with branch users
  for (let i = 1; i <= 11; i++) {
    const branch = await prisma.branch.upsert({
      where: { name: `Branch ${i}` },
      update: {},
      create: { name: `Branch ${i}` },
    });

    await prisma.user.upsert({
      where: { email: `branch${i}@example.com` },
      update: {},
      create: {
        email: `branch${i}@example.com`,
        password: hashedPassword,
        role: Role.BRANCH,
        branchId: branch.id,
      },
    });

    console.log(`✓ Branch ${i} created: branch${i}@example.com / password123`);
  }

  // Create template with fields
  const template = await prisma.template.upsert({
    where: { name: "Monthly Report" },
    update: {},
    create: {
      name: "Monthly Report",
      createdBy: "admin@example.com",
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

  // Create empty entries for all branches (only if not exist)
  for (let i = 1; i <= 11; i++) {
    const branch = await prisma.branch.findFirst({
      where: { name: `Branch ${i}` },
    });

    if (branch) {
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
  }

  console.log(`✓ Created empty entries for all branches`);

  console.log("\n✓ Seed completed!");
  console.log("\nTest accounts:");
  console.log("  Admin:     admin@example.com / password123");
  console.log("  Branch 1:  branch1@example.com / password123");
  console.log("  ...");
  console.log("  Branch 11: branch11@example.com / password123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

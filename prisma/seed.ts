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

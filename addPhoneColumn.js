import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "phone" TEXT;
    `);
    console.log("✅ 'phone' column added successfully!");
  } catch (error) {
    console.error("❌ Error adding column:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

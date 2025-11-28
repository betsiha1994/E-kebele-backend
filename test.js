const { PrismaClient } = require("@prisma/client");
console.log("Testing Prisma Client 5.0.0...");

async function test() {
  try {
    const prisma = new PrismaClient();
    console.log("SUCCESS: Prisma Client 5.0.0 initialized!");
    await prisma.$disconnect();
    console.log("SUCCESS: Disconnected successfully!");
  } catch (error) {
    console.log("ERROR:", error.message);
  }
}

test();

const { PrismaClient } = require("@prisma/client");
console.log("Testing Prisma setup...");

const prisma = new PrismaClient();

async function test() {
  try {
    // Test 1: Check connection
    console.log("1. Testing connection...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("   ✅ Connected");
    
    // Test 2: Check User model
    console.log("2. Testing User model...");
    const userCount = await prisma.user.count();
    console.log(`   ✅ User count: ${userCount}`);
    
    // Test 3: Check phone field
    console.log("3. Testing phone field...");
    const user = await prisma.user.findFirst({
      select: { email: true, phone: true }
    });
    
    if (user) {
      console.log(`   ✅ Found user: ${user.email}`);
      console.log(`   ✅ Phone field: '${user.phone || "null"}'`);
    } else {
      console.log("   ✅ User model accessible (table exists)");
    }
    
    console.log("\n🎉 PRISMA SETUP COMPLETE!");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

async function diagnose() {
  const prisma = new PrismaClient();

  console.log("🔍 DIAGNOSING PRISMA ISSUE...\n");

  try {
    // 1. Test connection
    console.log("1. Testing database connection...");
    await prisma.$connect();
    console.log("   ✅ Connected to database\n");

    // 2. Check User table structure
    console.log("2. Checking User table structure...");
    try {
      // Try to insert a user with phone field
      const testUser = await prisma.user.create({
        data: {
          name: "Diagnostic Test",
          email: `diagnostic${Date.now()}@test.com`,
          phone: "+251962710015",
          password: "temp123",
          role: "resident",
        },
      });
      console.log("   ✅ Phone field WORKS - User created successfully");
      console.log("   User details:", testUser);

      // Clean up
      await prisma.user.delete({ where: { id: testUser.id } });
      console.log("   Test user cleaned up\n");
    } catch (createError) {
      console.log("   ❌ Phone field ERROR:", createError.message);

      // 3. Try without phone field
      console.log("3. Testing without phone field...");
      try {
        const testUser2 = await prisma.user.create({
          data: {
            name: "Diagnostic Test 2",
            email: `diagnostic${Date.now()}@test.com`,
            password: "temp123",
            role: "resident",
            // No phone field
          },
        });
        console.log("   ✅ User created successfully WITHOUT phone field");
        console.log("   User details:", testUser2);

        // Clean up
        await prisma.user.delete({ where: { id: testUser2.id } });
      } catch (noPhoneError) {
        console.log("   ❌ Error even without phone:", noPhoneError.message);
      }
    }

    // 4. Check existing users structure
    console.log("\n4. Checking existing users...");
    const existingUsers = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });
    console.log("   Sample users:", JSON.stringify(existingUsers, null, 2));
  } catch (error) {
    console.log("   ❌ General error:", error.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n✅ Diagnosis complete");
  }
}

diagnose();

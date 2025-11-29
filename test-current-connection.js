require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('=== Testing Current Connection ===\n');

async function testCurrent() {
  const prisma = new PrismaClient();
  
  try {
    console.log('1. Testing connection with current DATABASE_URL...');
    await prisma.$connect();
    console.log('   ✅ Connected successfully!');
    
    console.log('2. Testing basic query...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log(`   ✅ Found ${users.length} users`);
    
    console.log('3. Testing phone field...');
    const testUser = await prisma.user.create({
      data: {
        name: "Connection Test",
        email: `test${Date.now()}@connection.com`,
        phone: "+251962710015",
        password: "temp123",
        role: "resident"
      }
    });
    console.log('   ✅ Phone field works! User ID:', testUser.id);
    
    // Clean up
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('   Test user cleaned up');
    
    console.log('\n🎉 SUCCESS! Your current connection is working.');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 AUTHENTICATION ERROR:');
      console.log('   - Password might be incorrect');
      console.log('   - Get fresh connection string from Neon.tech');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testCurrent();
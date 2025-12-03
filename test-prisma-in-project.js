// test-prisma-in-project.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('1. Testing import... ✅');
    
    // Check if user model exists
    console.log('2. Testing User model...');
    const count = await prisma.user.count();
    console.log(`   Found ${count} users ✅`);
    
    // Check if phone field exists
    console.log('3. Testing phone field...');
    const user = await prisma.user.findFirst();
    if (user) {
      console.log(`   User phone: ${user.phone} ✅`);
    }
    
    console.log('\n🎉 Prisma is working in your project!');
    console.log('You can now use prisma.user, prisma.service, etc.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nPossible fixes:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Check schema.prisma has all models');
    console.log('3. Check .env has correct DATABASE_URL');
  } finally {
    await prisma.$disconnect();
  }
}

test();
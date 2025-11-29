require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkSchema() {
  const prisma = new PrismaClient();
  
  console.log('=== Checking Database Schema ===\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // Check User table structure
    console.log('1. Checking User table columns:');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    // Check if phone column exists
    const hasPhone = columns.some(col => col.column_name === 'phone');
    console.log(`\n2. Phone column exists: ${hasPhone ? '✅ YES' : '❌ NO'}`);

    if (!hasPhone) {
      console.log('\n💡 SOLUTION: Phone column is missing from database');
      console.log('   Running: npx prisma db push --force-reset');
    } else {
      console.log('\n💡 Phone column exists but Prisma client might be outdated');
      console.log('   Running: npx prisma generate');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
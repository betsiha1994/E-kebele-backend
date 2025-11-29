import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('=== DETAILED PRISMA CLIENT INSPECTION ===');

try {
  // Check User model fields
  const fields = Object.keys(prisma.user.fields);
  console.log('📋 Available fields in User model:');
  fields.forEach(field => {
    const fieldInfo = prisma.user.fields[field];
    console.log(`  - ${field} (type: ${fieldInfo.typeName}, required: ${!fieldInfo.isRequired})`);
  });
  
  console.log('\n🔍 Phone field exists:', fields.includes('phone'));
  console.log('🔍 Total fields:', fields.length);
  
} catch (error) {
  console.log('❌ Cannot inspect User model:', error.message);
}

process.exit(0);
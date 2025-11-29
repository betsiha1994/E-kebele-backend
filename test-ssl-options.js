require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testWithSSL() {
  console.log('Testing different SSL configurations...\n');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL is not set in .env file');
    return;
  }
  
  const baseUrl = process.env.DATABASE_URL.split('?')[0]; // Remove existing query params
  
  const tests = [
    { name: 'require SSL', url: baseUrl + '?sslmode=require' },
    { name: 'prefer SSL', url: baseUrl + '?sslmode=prefer' },
    { name: 'no SSL', url: baseUrl + '?sslmode=disable' },
  ];
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${test.url.replace(/:[^:@]+@/, ':****@')}`);
    
    // Create new Prisma client with custom URL
    const prisma = new PrismaClient({
      datasourceUrl: test.url,
    });
    
    try {
      await prisma.$connect();
      console.log(`✅ ${test.name}: SUCCESS\n`);
      await prisma.$disconnect();
      break; // Stop at first successful connection
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}\n`);
      await prisma.$disconnect();
    }
  }
}

testWithSSL();
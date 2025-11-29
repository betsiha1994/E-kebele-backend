require('dotenv').config();

console.log('=== Checking Environment Variables ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  // Hide password for security
  const safeUrl = url.replace(/:[^:@]+@/, ':****@');
  console.log('DATABASE_URL:', safeUrl);
  
  // Check for SSL
  console.log('Has sslmode:', url.includes('sslmode='));
  console.log('Has pooler:', url.includes('pooler'));
  
  // Check connection details
  const urlParts = url.match(/postgresql:\/\/([^:]+):[^@]+@([^:]+):(\d+)\/([^?]+)/);
  if (urlParts) {
    console.log('Username:', urlParts[1]);
    console.log('Host:', urlParts[2]);
    console.log('Port:', urlParts[3]);
    console.log('Database:', urlParts[4]);
  }
} else {
  console.log('❌ DATABASE_URL is not set!');
}

console.log('====================================');
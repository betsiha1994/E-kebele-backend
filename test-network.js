const net = require('net');
require('dotenv').config();

function testConnection() {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(5432, 'ep-floral-voice-adx5l7w7-pooler.c-2.us-east-1.aws.neon.tech');
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      console.log('✅ Network: Can reach Neon.tech server');
      socket.end();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log('❌ Network: Connection timeout');
      socket.destroy();
      reject(new Error('Timeout'));
    });
    
    socket.on('error', (error) => {
      console.log('❌ Network: Connection failed:', error.message);
      reject(error);
    });
  });
}

async function main() {
  console.log('Testing connection to Neon.tech...');
  console.log('Host: ep-floral-voice-adx5l7w7-pooler.c-2.us-east-1.aws.neon.tech');
  console.log('Port: 5432\n');
  
  try {
    await testConnection();
    console.log('\n✅ Network connection is OK - issue is likely SSL or authentication');
  } catch (error) {
    console.log('\n❌ Network connection failed - check internet or firewall');
  }
}

main();
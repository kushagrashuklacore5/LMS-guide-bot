/**
 * Test script to verify announcements API is working
 * Run: node test-announcements-api.js
 */

const http = require('http');

// Test announcements endpoint
const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/announcements',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test-token-for-debugging',
    'Content-Type': 'application/json'
  }
};

console.log('Testing GET /api/announcements...');
console.log(`URL: http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      console.log(`\n✅ Received ${parsed?.length || 0} announcements`);
    } catch (e) {
      console.log(data);
      console.log(`\n❌ Response is not JSON`);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
  console.log('Make sure the backend is running on port 5002');
});

req.end();

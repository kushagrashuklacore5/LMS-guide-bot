#!/usr/bin/env node

/**
 * Test script: Mark announcement as read
 * Tests if the PUT /api/announcements/{id}/read endpoint works
 */

const http = require('http');

const API_URL = 'http://localhost:5002';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJzdHVkZW50In0.fake'; // Fake JWT

function testMarkAsRead(announcementId, userId = 1) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5002,
      path: `/api/announcements/${announcementId}/read`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': 0,
      }
    };

    console.log(`\n🧪 Testing mark as read for announcement ${announcementId}...`);
    console.log(`   URL: ${API_URL}${options.path}`);
    console.log(`   Token: ${TOKEN.substring(0, 20)}...`);

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const responseBody = data ? JSON.parse(data) : {};
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response:`, responseBody);
          
          if (res.statusCode === 200) {
            console.log(`✅ SUCCESS: Announcement ${announcementId} marked as read`);
            resolve(true);
          } else {
            console.log(`❌ ERROR: Expected 200, got ${res.statusCode}`);
            reject(new Error(`Status ${res.statusCode}`));
          }
        } catch (e) {
          console.error(`❌ Failed to parse response:`, data);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Request error:`, e.message);
      reject(e);
    });

    req.end();
  });
}

async function main() {
  console.log('🧪 Testing Announcement Mark-as-Read Functionality\n');
  
  try {
    // Test with announcements 1, 2, 3 (from the screenshot)
    await testMarkAsRead(1);
    await testMarkAsRead(2);
    await testMarkAsRead(3);
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();

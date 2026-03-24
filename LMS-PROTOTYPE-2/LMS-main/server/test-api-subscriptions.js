#!/usr/bin/env node
/**
 * Quick API Test - Verify subscriptions endpoint works
 */

const https = require('https');
const http = require('http');

const API_URL = 'http://localhost:5002/api/subscriptions/current';

console.log('🧪 Testing Subscriptions API...\n');
console.log(`📡 Making request to: ${API_URL}\n`);

const protocol = API_URL.startsWith('https') ? https : http;

const options = {
  headers: {
    'Authorization': 'Bearer test-token',
    'Content-Type': 'application/json'
  }
};

protocol.get(API_URL, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}\n`);
    
    try {
      const json = JSON.parse(data);
      console.log('✅ Response:');
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success && json.subscription) {
        console.log('\n📊 Subscription Details:');
        console.log(`   ✅ Plan: ${json.subscription.planName}`);
        console.log(`   ✅ Type: ${json.subscription.planType}`);
        console.log(`   ✅ Status: ${json.subscription.status}`);
        console.log(`   ✅ Remaining: ${json.subscription.remainingSeconds} seconds`);
        console.log('\n✨ API is working correctly with SQLite!');
      }
    } catch (e) {
      console.log('Raw response:');
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('\n⚠️  Backend server is not running on port 5002');
    console.error('Run: npm start (in server directory) to start the server');
  }
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Simple test to fetch announcements as a student
 */
const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJzdHVkZW50In0.fake';

const options = {
  hostname: '127.0.0.1',
  port: 5002,
  path: '/api/announcements',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  }
};

console.log('🧪 Fetching announcements as student (userId: 3)...\n');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const announcements = JSON.parse(data);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Count: ${announcements.length}\n`);
      
      announcements.forEach((ann, idx) => {
        console.log(`[${idx + 1}] Title: ${ann.title}`);
        console.log(`    PublishFor: ${ann.publishFor}`);
        console.log(`    CreatedByRole: ${ann.createdByRole}`);
        console.log('');
      });
    } catch (e) {
      console.error('Parse error:', e);
      console.log('Raw data:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});

req.end();

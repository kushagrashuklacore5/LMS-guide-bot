#!/usr/bin/env node
const jwt = require('jsonwebtoken');
const http = require('http');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
// Use admin userId 1
const token = jwt.sign({ userId: 1, role: 'admin', name: 'Admin' }, JWT_SECRET, { expiresIn: '1h' });

const payload = JSON.stringify({
  title: 'Auto test announcement',
  message: 'This is a test announcement created by script',
  publishFor: 'students'
});

const options = {
  hostname: '127.0.0.1',
  port: 5002,
  path: '/api/announcements',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('\n→ Sending POST /api/announcements as admin...');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try { console.log('Body:', JSON.parse(data)); } catch (e) { console.log('Body:', data); }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.write(payload);
req.end();

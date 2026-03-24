#!/usr/bin/env node

console.log('🧾 TESTING INVOICE DOWNLOAD ENDPOINT');
console.log('====================================');

const http = require('http');

// Test the download-invoice endpoint
const testData = {
  paymentId: 'TEST123',
  studentName: 'Test Student',
  amount: 5000,
  paymentDate: new Date().toISOString(),
  paymentMethod: 'Online'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/accountant/download-invoice',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer test-token'
  }
};

console.log('📤 Sending test request to download-invoice endpoint...');
console.log('📋 Test data:', testData);

const req = http.request(options, (res) => {
  console.log('📥 Response status:', res.statusCode);
  console.log('📥 Response headers:', res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Response received successfully!');
      console.log('📄 Response keys:', Object.keys(response));
      
      if (response.success) {
        console.log('🎉 Invoice generation successful!');
        console.log('📄 Invoice type:', response.type);
        console.log('📊 Invoice data length:', response.invoice ? response.invoice.length : 0);
        console.log('✅ Download invoice endpoint is working!');
      } else {
        console.log('❌ Invoice generation failed:', response.message);
      }
    } catch (error) {
      console.log('📄 Raw response:', data.substring(0, 200) + '...');
      console.log('❌ Error parsing response:', error.message);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Request error:', err.message);
  console.log('💡 Make sure the backend server is running on port 5002');
});

req.write(postData);
req.end();

console.log('⏳ Waiting for response...');

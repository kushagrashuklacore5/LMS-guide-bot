// Test the vendor API endpoint directly
const http = require('http');

console.log('🧪 Testing vendor API endpoint directly...');

const testData = {
  name: 'Test Vendor Direct',
  email: 'test@direct.com',
  phone: '1234567890',
  address: 'Test Address',
  category: 'Test Category'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/storekeeper/vendors',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer test-token'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response status:', res.statusCode);
    try {
      const response = JSON.parse(data);
      console.log('✅ Response data:', JSON.stringify(response, null, 2));
      
      if (response.data && response.data.generatedPassword) {
        console.log('🎉 SUCCESS: Password is being returned!');
        console.log('📧 Email:', response.data.email);
        console.log('🔐 Password:', response.data.generatedPassword);
      } else {
        console.log('❌ ISSUE: No password in response');
        console.log('📊 Response structure:', Object.keys(response.data));
      }
    } catch (e) {
      console.log('❌ Failed to parse response:', e);
      console.log('Raw response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e);
  process.exit(1);
});

req.write(postData);
req.end();

const http = require('http');

console.log('🧪 Testing Create University API');
console.log('==================================');

const universityData = {
  universityName: 'API Test University',
  area: 'Test Area',
  adminName: 'API Admin',
  adminEmail: 'apiadmin@example.com'
};

const postData = JSON.stringify(universityData);

const options = {
  hostname: '127.0.0.1',
  port: 5002,
  path: '/api/test/create-university',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📤 Sending request to create university...');
console.log('📊 Data:', universityData);

const req = http.request(options, (res) => {
  console.log(`📋 Status Code: ${res.statusCode}`);
  console.log('📋 Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 Response Body:', data);
    try {
      const response = JSON.parse(data);
      console.log('📊 Parsed Response:', response);
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.write(postData);
req.end();

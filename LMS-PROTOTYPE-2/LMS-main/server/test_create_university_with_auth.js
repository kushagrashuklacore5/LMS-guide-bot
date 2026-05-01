const http = require('http');

console.log('🧪 Testing Create University API with Auth');
console.log('=============================================');

const universityData = {
  universityName: 'API Test University Auth',
  area: 'Test Area',
  adminName: 'API Admin',
  adminEmail: 'apiadminauth@example.com'
};

const postData = JSON.stringify(universityData);

const options = {
  hostname: '127.0.0.1',
  port: 5002,
  path: '/api/superadmin/create-university',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdXBlcmFkbWluSWQiOiJ0ZXN0LXN1cGVyYWRtaW4tMSIsImVtYWlsIjoicG9ydGFsQGNvcmU1LmNvLmluIiwicm9sZSI6InN1cGVyYWRtaW4iLCJuYW1lIjoiUG9ydGFsIiwidW5pdmVyc2l0eUlkIjoxLCJpYXQiOjE3Nzc0MDM4ODksImV4cCI6MTc3NzQwNDQ4OX0.test'
  }
};

console.log('📤 Sending request to create university with auth...');
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

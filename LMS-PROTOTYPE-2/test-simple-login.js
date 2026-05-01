const http = require('http');

console.log('🔐 Testing simple login...\n');

const loginData = JSON.stringify({
  email: 'superadmin@core5.co.in',
  password: '12345678'
});

const loginOptions = {
  hostname: '127.0.0.1',
  port: 5002,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('🔍 Login Response Status:', res.statusCode);
    console.log('🔍 Login Response Headers:', res.headers);
    
    try {
      const loginResponse = JSON.parse(data);
      console.log('🔍 Login Response Body:', loginResponse);
      
      if (loginResponse.token) {
        console.log('✅ Login successful!');
        console.log('🔑 Token length:', loginResponse.token.length);
        console.log('🔑 Token preview:', loginResponse.token.substring(0, 50) + '...');
        
        // Now test a simple endpoint with the token
        testWithToken(loginResponse.token);
      } else {
        console.log('❌ Login failed - no token found');
        console.log('Message:', loginResponse.message);
      }
    } catch (e) {
      console.log('❌ Login response error:', e.message);
      console.log('Raw response:', data);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('❌ Login request error:', e.message);
});

loginReq.write(loginData);
loginReq.end();

function testWithToken(token) {
  console.log('\n🧪 Testing endpoint with token...\n');
  
  const options = {
    hostname: '127.0.0.1',
    port: 5002,
    path: '/api/universities',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('🧪 Endpoint Test Results:');
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
      } catch (e) {
        console.log('Raw Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Endpoint request error:', e.message);
  });

  req.end();
}

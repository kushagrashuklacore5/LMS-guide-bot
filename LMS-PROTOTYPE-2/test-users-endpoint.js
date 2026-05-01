const http = require('http');

function testUsersEndpoint() {
  // First login to get token
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
      try {
        const loginResponse = JSON.parse(data);
        console.log('🔍 Login response:', loginResponse);
        if (loginResponse.token) {
          console.log('✅ Login successful!');
          console.log('🔑 Token:', loginResponse.token.substring(0, 50) + '...');
          
          // Now test users endpoint
          testUsersEndpoint(loginResponse.token);
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
}

function testUsersEndpoint(token) {
  const options = {
    hostname: '127.0.0.1',
    port: 5002,
    path: '/api/users',
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
      console.log('\n🧪 Users Endpoint Test Results:');
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
        
        if (res.statusCode === 200 && response.success) {
          console.log(`✅ Users endpoint working! Found ${response.data?.length || 0} users`);
        } else {
          console.log('❌ Users endpoint failed:', response.message || 'Unknown error');
        }
      } catch (e) {
        console.log('Raw Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Users endpoint request error:', e.message);
  });

  req.end();
}

testUsersEndpoint();

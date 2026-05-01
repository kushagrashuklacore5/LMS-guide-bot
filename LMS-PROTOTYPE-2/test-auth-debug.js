const http = require('http');

function testAuthDebug() {
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
        if (loginResponse.token) {
          console.log('✅ Login successful!');
          console.log('User object:', loginResponse.user);
          console.log('Token payload (decoded):');
          
          // Decode token to see payload
          const jwt = require('jsonwebtoken');
          const decoded = jwt.decode(loginResponse.token);
          console.log(decoded);
          
          // Now test a protected route to see what happens
          testProtectedRoute(loginResponse.token);
        } else {
          console.log('❌ Login failed:', loginResponse.message);
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

function testProtectedRoute(token) {
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
      console.log('\n🧪 Protected Route Test Results:');
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
    console.error('❌ Protected route request error:', e.message);
  });

  req.end();
}

testAuthDebug();

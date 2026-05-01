const http = require('http');

function testUniversityCreation() {
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
        if (loginResponse.token) {
          console.log('✅ Login successful!');
          
          // Now test university creation
          testCreateUniversity(loginResponse.token);
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

function testCreateUniversity(token) {
  const universityData = JSON.stringify({
    universityName: 'Test University',
    area: 'Test Area',
    adminName: 'Test Admin',
    adminEmail: 'testadmin@test.com'
  });

  const options = {
    hostname: '127.0.0.1',
    port: 5002,
    path: '/api/superadmin/create-university',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(universityData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n🧪 University Creation Test Results:');
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
        
        if (res.statusCode === 201 && response.university) {
          console.log('✅ University creation successful!');
        } else {
          console.log('❌ University creation failed:', response.message || 'Unknown error');
        }
      } catch (e) {
        console.log('Raw Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ University creation request error:', e.message);
  });

  req.write(universityData);
  req.end();
}

testUniversityCreation();

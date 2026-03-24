const http = require('http');

const loginData = JSON.stringify({
  email: 'anisingh2309@gmail.com',
  password: '12345678'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const response = JSON.parse(data);
    console.log('Message:', response.message);
    console.log('User Email:', response.user?.email);
    console.log('User Role:', response.user?.role);
    console.log('Token:', response.token ? 'Generated ✅' : 'Missing ❌');
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(loginData);
req.end();

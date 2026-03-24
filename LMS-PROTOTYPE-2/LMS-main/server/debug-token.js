const http = require('http');
const jwt = require('jsonwebtoken');

// Try both secrets to see which one works
const JWT_SECRET_1 = 'your_jwt_secret_key_here';
const JWT_SECRET_2 = 'default_jwt_secret_key';

console.log('Testing with JWT_SECRET_1:', JWT_SECRET_1);
const adminToken = jwt.sign({ userId: 1, role: 'admin', name: 'Admin' }, JWT_SECRET_1, { expiresIn: '1h' });

console.log('Admin Token:', adminToken);
console.log('Decoded:', jwt.verify(adminToken, JWT_SECRET_1));


function request(method, path, token, data = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: '127.0.0.1',
      port: 5002,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('\nTesting announcement creation...\n');
  try {
    const res = await request('POST', '/api/announcements', adminToken, {
      title: 'Test Admin Announcement',
      message: 'This is from admin',
      publishFor: 'students'
    });
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
})();

const http = require('http');

const testAccounts = [
  { email: 'admin@gmail.com', password: '12345678', expectedRole: 'admin' },
  { email: 'student@gmail.com', password: '12345678', expectedRole: 'student' },
  { email: 'mentor@gmail.com', password: '12345678', expectedRole: 'mentor' },
  { email: 'anisingh2309@gmail.com', password: '12345678', expectedRole: 'student' },
  { email: 'robo@abc.com', password: '12345678', expectedRole: 'mentor' },
  { email: 'robin@abc.com', password: '12345678', expectedRole: 'mentor' }
];

async function testLogin(account) {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: account.email,
      password: account.password
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
        try {
          const response = JSON.parse(data);
          const success = res.statusCode === 200 && response.user?.email === account.email;
          console.log(success ? '✅' : '❌', account.email.padEnd(25), 'Role:', response.user?.role?.padEnd(10) || 'N/A', 'Status:', response.message);
        } catch (e) {
          console.log('❌', account.email.padEnd(25), 'Parse Error');
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('❌', account.email.padEnd(25), 'Error:', error.message);
      resolve();
    });

    req.write(loginData);
    req.end();
  });
}

async function runTests() {
  console.log('\n📋 Testing All User Accounts:\n');
  for (const account of testAccounts) {
    await testLogin(account);
  }
  console.log('\n✅ All tests completed!\n');
}

runTests();

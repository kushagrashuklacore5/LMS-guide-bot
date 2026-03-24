const http = require('http');

async function testAPI() {
  console.log('🔍 Testing accountant invoices API...');
  
  const options = {
    hostname: '127.0.0.1',
    port: 5002,
    path: '/api/accountant/vendor-invoices',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-token',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });

  req.on('error', (error) => {
    console.log('Error:', error.message);
  });

  req.end();
}

testAPI();

const http = require('http');

async function testRazorpayConfig() {
  console.log('🔍 Testing Razorpay config endpoint...');
  
  const options = {
    hostname: '127.0.0.1',
    port: 5002,
    path: '/api/accountant/razorpay-config',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-token',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    
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

testRazorpayConfig();

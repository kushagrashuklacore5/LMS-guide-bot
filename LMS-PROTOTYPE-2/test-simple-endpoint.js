const http = require('http');

function testSimpleEndpoint() {
  const options = {
    hostname: '127.0.0.1',
    port: 5002,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('🧪 Simple Endpoint Test Results:');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error('❌ Simple endpoint request error:', e.message);
  });

  req.end();
}

testSimpleEndpoint();

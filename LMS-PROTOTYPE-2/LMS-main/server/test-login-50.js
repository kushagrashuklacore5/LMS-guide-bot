// Test login endpoint with 50 requests per minute rate limiting
const http = require('http');

async function testLogin50() {
  console.log('🧪 Testing login endpoint rate limiting (50 requests per minute)...');
  
  for (let i = 1; i <= 5; i++) {
    const options = {
      hostname: '127.0.0.1',
      port: 5002,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const result = await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 429) {
            console.log(`Request ${i}: 🚫 RATE LIMITED (429)`);
          } else if (res.statusCode === 401) {
            console.log(`Request ${i}: ✅ AUTH FAILED (401)`);
          } else {
            console.log(`Request ${i}: ❌ UNEXPECTED (${res.statusCode})`);
          }
          
          resolve({
            statusCode: res.statusCode,
            rateLimited: res.statusCode === 429
          });
        });
      });

      req.on('error', (err) => {
        console.log(`Request ${i}: ❌ ERROR - ${err.message}`);
        resolve({
          statusCode: 'ERROR',
          rateLimited: false
        });
      });

      req.write(JSON.stringify({ email: 'test@test.com', password: 'wrongpassword' }));
      req.end();
    });

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n✅ Login endpoint test completed');
}

testLogin50().catch(console.error);

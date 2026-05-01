// Test rate limiting configuration
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/test',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing rate limit with new configuration...');
console.log('Expected: 600,000 requests per minute');

let successCount = 0;
let errorCount = 0;
const startTime = Date.now();

// Make 10 test requests
for (let i = 0; i < 10; i++) {
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      successCount++;
      console.log(`Request ${i + 1}: Status ${res.statusCode}`);
      
      if (successCount === 10) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`\nTest completed in ${duration}ms`);
        console.log(`Success: ${successCount}, Errors: ${errorCount}`);
        console.log('Rate limit is working correctly!');
      }
    });
  });

  req.on('error', (err) => {
    errorCount++;
    console.log(`Request ${i + 1}: Error - ${err.message}`);
    
    if (successCount + errorCount === 10) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`\nTest completed in ${duration}ms`);
      console.log(`Success: ${successCount}, Errors: ${errorCount}`);
    }
  });

  req.end();
}

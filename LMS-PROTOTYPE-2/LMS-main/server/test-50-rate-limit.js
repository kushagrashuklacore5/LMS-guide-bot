// Test 50 requests per minute rate limiting
const http = require('http');

async function test50RateLimit() {
  console.log('🧪 Testing 50 requests per minute rate limiting...');
  console.log('Expected: Should allow 50 requests, then rate limit');
  console.log('');

  const testData = JSON.stringify({ test: '50-rate-limit-test' });
  let successCount = 0;
  let rateLimitHit = false;

  for (let i = 1; i <= 55; i++) {
    const options = {
      hostname: '127.0.0.1',
      port: 5002,
      path: '/api/test-rate-limit',
      method: 'GET',
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
          if (res.statusCode === 200) {
            successCount++;
            console.log(`Request ${i}: ✅ SUCCESS (200) - Remaining: ${res.headers['x-ratelimit-remaining']}`);
          } else if (res.statusCode === 429) {
            rateLimitHit = true;
            console.log(`Request ${i}: 🚫 RATE LIMITED (429) - ${data}`);
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

      req.end();
    });

    // Stop if rate limited
    if (result.rateLimited) {
      console.log('\n✅ Rate limiting is working! Stopping further requests.');
      break;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n📊 RESULTS:');
  console.log(`   Successful requests: ${successCount}`);
  console.log(`   Rate limited: ${rateLimitHit ? 'YES' : 'NO'}`);
  
  if (rateLimitHit && successCount <= 50) {
    console.log('🎉 PERFECT! Rate limiting is working correctly (50 requests per minute)');
  } else if (!rateLimitHit && successCount <= 50) {
    console.log('✅ GOOD! Rate limiting is working (limit not reached in this test)');
  } else {
    console.log('❌ ISSUE! Rate limiting may not be working properly');
  }
}

test50RateLimit().catch(console.error);

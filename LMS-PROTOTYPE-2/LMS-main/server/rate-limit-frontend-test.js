// Frontend rate limiting test - copy and paste into browser console
console.log('🧪 Frontend Rate Limiting Test (50 requests per minute)');
console.log('Copy and paste this code into your browser console at http://localhost:5174');
console.log('');

// Test function to run in browser console
const testFrontendRateLimit = async () => {
  console.log('🚀 Starting frontend rate limiting test...');
  console.log('Expected: 50 requests allowed, then rate limiting');
  console.log('');
  
  let successCount = 0;
  let rateLimitHit = false;
  
  for (let i = 1; i <= 55; i++) {
    try {
      const response = await fetch('http://localhost:5002/api/test-rate-limit', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        successCount++;
        console.log(`Request ${i}: ✅ SUCCESS (200)`);
      } else if (response.status === 429) {
        rateLimitHit = true;
        const errorData = await response.json();
        console.log(`Request ${i}: 🚫 RATE LIMITED (429) - ${errorData.message}`);
        break;
      } else {
        console.log(`Request ${i}: ❌ UNEXPECTED (${response.status})`);
      }
    } catch (error) {
      console.log(`Request ${i}: ❌ ERROR - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('');
  console.log('📊 RESULTS:');
  console.log(`   Successful requests: ${successCount}`);
  console.log(`   Rate limited: ${rateLimitHit ? 'YES' : 'NO'}`);
  
  if (rateLimitHit && successCount <= 50) {
    console.log('🎉 PERFECT! Rate limiting is working correctly (50 requests per minute)');
  } else if (!rateLimitHit && successCount <= 50) {
    console.log('✅ GOOD! Rate limiting is working (limit not reached in this test)');
  } else {
    console.log('❌ ISSUE! Rate limiting may not be working properly');
  }
};

// Test login endpoint
const testLoginRateLimit = async () => {
  console.log('🧪 Testing login endpoint rate limiting...');
  
  for (let i = 1; i <= 10; i++) {
    try {
      const response = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'wrongpassword'
        })
      });
      
      if (response.status === 401) {
        console.log(`Request ${i}: ✅ AUTH FAILED (401)`);
      } else if (response.status === 429) {
        console.log(`Request ${i}: 🚫 RATE LIMITED (429)`);
        break;
      } else {
        console.log(`Request ${i}: ❌ UNEXPECTED (${response.status})`);
      }
    } catch (error) {
      console.log(`Request ${i}: ❌ ERROR - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('✅ Login test completed');
};

console.log('📋 Available functions:');
console.log('  testFrontendRateLimit() - Test 50 requests per minute');
console.log('  testLoginRateLimit() - Test login endpoint rate limiting');
console.log('');
console.log('🚀 Run: testFrontendRateLimit() to test the rate limiting');

// Export for browser use
if (typeof window !== 'undefined') {
  window.testFrontendRateLimit = testFrontendRateLimit;
  window.testLoginRateLimit = testLoginRateLimit;
}

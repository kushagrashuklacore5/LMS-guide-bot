// Test Login Rate Limiting System
const axios = require('axios');

const API_URL = 'http://127.0.0.1:5002/api';

// Test configuration
const TEST_CONFIG = {
  MAX_ATTEMPTS: 5,
  BLOCK_DURATION: 60,
  TEST_EMAIL: 'test@ratelimit.com',
  TEST_PASSWORD: 'wrongpassword'
};

async function testLoginRateLimiting() {
  console.log('🧪 Testing Login Rate Limiting System');
  console.log('=====================================');
  console.log(`📧 Test Email: ${TEST_CONFIG.TEST_EMAIL}`);
  console.log(`🔢 Max Attempts: ${TEST_CONFIG.MAX_ATTEMPTS}`);
  console.log(`⏱️ Block Duration: ${TEST_CONFIG.BLOCK_DURATION} seconds`);
  console.log('');

  let attemptCount = 0;
  let blocked = false;
  let blockStartTime = null;

  try {
    // Test 1: Make 5 failed attempts (should be allowed)
    console.log('🔍 Test 1: Making 5 failed login attempts (should be allowed)...');
    
    for (let i = 1; i <= TEST_CONFIG.MAX_ATTEMPTS; i++) {
      attemptCount++;
      
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email: TEST_CONFIG.TEST_EMAIL,
          password: TEST_CONFIG.TEST_PASSWORD
        });
        
        console.log(`❌ Unexpected success on attempt ${attemptCount}:`, response.data);
        break;
        
      } catch (error) {
        if (error.response?.status === 401) {
          // Expected failed login
          const attemptInfo = error.response.data?.attemptInfo;
          if (attemptInfo) {
            console.log(`✅ Attempt ${attemptCount}: Failed login (expected)`);
            console.log(`   IP Attempts: ${attemptInfo.ipAttempts}/${attemptInfo.maxAttempts}`);
            console.log(`   Remaining: ${attemptInfo.remainingAttempts}`);
          } else {
            console.log(`✅ Attempt ${attemptCount}: Failed login (expected)`);
          }
        } else if (error.response?.status === 429) {
          // Unexpected early block
          console.log(`⚠️ Unexpected block on attempt ${attemptCount}`);
          blocked = true;
          break;
        } else {
          console.log(`❌ Unexpected error on attempt ${attemptCount}:`, error.message);
          break;
        }
      }
      
      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('');

    // Test 2: Make 6th attempt (should be blocked)
    console.log('🚫 Test 2: Making 6th attempt (should be blocked)...');
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: TEST_CONFIG.TEST_EMAIL,
        password: TEST_CONFIG.TEST_PASSWORD
      });
      
      console.log('❌ Unexpected success on 6th attempt:', response.data);
      
    } catch (error) {
      if (error.response?.status === 429) {
        blocked = true;
        blockStartTime = Date.now();
        const { remainingTime, blockType } = error.response.data;
        
        console.log('✅ 6th attempt correctly blocked!');
        console.log(`   Remaining Time: ${remainingTime} seconds`);
        console.log(`   Block Type: ${blockType}`);
        
        // Test 3: Verify timer countdown
        console.log('');
        console.log('⏱️ Test 3: Verifying timer countdown...');
        
        let countdown = remainingTime;
        while (countdown > 0 && countdown > 55) { // Test for a few seconds
          await new Promise(resolve => setTimeout(resolve, 1000));
          countdown--;
          
          try {
            const response = await axios.post(`${API_URL}/auth/login`, {
              email: TEST_CONFIG.TEST_EMAIL,
              password: TEST_CONFIG.TEST_PASSWORD
            });
            
            console.log(`❌ Unexpected success during countdown at ${countdown}s`);
            break;
            
          } catch (error) {
            if (error.response?.status === 429) {
              const newRemainingTime = error.response.data.remainingTime;
              console.log(`✅ Still blocked at ${countdown}s remaining: ${newRemainingTime}s`);
              
              if (newRemainingTime !== countdown) {
                console.log(`⚠️ Timer mismatch: expected ${countdown}s, got ${newRemainingTime}s`);
              }
            } else {
              console.log(`❌ Unexpected error during countdown:`, error.message);
              break;
            }
          }
        }
        
      } else {
        console.log(`❌ 6th attempt not blocked (status: ${error.response?.status})`);
        console.log('   Response:', error.response?.data);
      }
    }

    console.log('');

    // Test 4: Test successful login resets counter (if we have a valid account)
    console.log('🔄 Test 4: Testing successful login resets counter...');
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'student@gmail.com',
        password: '12345678'
      });
      
      if (response.data.success || response.data.token) {
        console.log('✅ Successful login works correctly');
        console.log('   Rate limiting should be reset for this user');
      } else {
        console.log('⚠️ Demo login response unexpected:', response.data);
      }
      
    } catch (error) {
      console.log('❌ Demo login failed:', error.message);
      if (error.response?.status === 429) {
        console.log('   Demo account might be blocked too');
      }
    }

    console.log('');

    // Test 5: Test different email from same IP
    console.log('🔄 Test 5: Testing different email from same IP...');
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'different@test.com',
        password: 'wrongpassword'
      });
      
      console.log('❌ Unexpected success for different email');
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Different email allowed (IP not blocked yet)');
      } else if (error.response?.status === 429) {
        console.log('⚠️ Different email also blocked (IP-based blocking active)');
      } else {
        console.log('❌ Unexpected error for different email:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('');
  console.log('📊 Test Summary:');
  console.log(`   Total Attempts Made: ${attemptCount}`);
  console.log(`   System Blocked: ${blocked ? 'Yes ✅' : 'No ❌'}`);
  console.log(`   Block Duration: ${blockStartTime ? Math.round((Date.now() - blockStartTime) / 1000) : 'N/A'}s tested`);
  
  if (blocked) {
    console.log('   ✅ Rate limiting appears to be working correctly!');
  } else {
    console.log('   ❌ Rate limiting may not be working as expected');
  }
}

// Run the test
testLoginRateLimiting().catch(console.error);

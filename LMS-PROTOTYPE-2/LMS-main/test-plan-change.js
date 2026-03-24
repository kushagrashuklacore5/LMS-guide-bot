// Manual test for real-time plan propagation
const axios = require('axios');

const API_BASE = 'http://localhost:5002';

async function testPlanChange() {
  console.log('🧪 Manual Plan Change Test\n');
  
  // Test with SuperAdmin token for user 33 (Aniket2's SuperAdmin)
  const testToken = 'YOUR_TOKEN_HERE'; // Replace with actual token
  
  if (testToken === 'YOUR_TOKEN_HERE') {
    console.log('⚠️ Please get a JWT token from browser localStorage');
    console.log('   1. Login as SuperAdmin');
    console.log('   2. Open DevTools → Application → Local Storage');
    console.log('   3. Copy the token value');
    console.log('   4. Update the testToken variable');
    return;
  }
  
  try {
    console.log('1️⃣ Testing plan upgrade to Standard...');
    
    // Upgrade to Standard
    const upgradeResponse = await axios.post(`${API_BASE}/api/subscriptions/test-upgrade`, {
      planId: 'standard',
      planName: 'Standard',
      durationDays: 30
    }, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    console.log('✅ Upgrade successful:', upgradeResponse.data.message);
    console.log('📊 New plan:', upgradeResponse.data.subscription);
    
    console.log('\n2️⃣ Waiting 2 seconds then testing downgrade...');
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('3️⃣ Testing plan downgrade to Free...');
    
    // Downgrade to Free
    const downgradeResponse = await axios.post(`${API_BASE}/api/subscriptions/cancel`, {}, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    console.log('✅ Downgrade successful:', downgradeResponse.data.message);
    console.log('📊 New plan:', downgradeResponse.data.subscription);
    
    console.log('\n🎯 Check the backend console for propagation logs');
    console.log('   You should see "IMMEDIATE PROPAGATION" messages');
    console.log('   And Socket.IO emissions to connected clients');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPlanChange();

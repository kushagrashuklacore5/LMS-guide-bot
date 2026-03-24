// Quick test to verify cancel subscription fix
const axios = require('axios');

const API_BASE = 'http://localhost:5002';

async function quickTest() {
  console.log('🧪 Quick Cancel Subscription Test\n');
  
  // Test with a sample SuperAdmin token (you'll need to replace this)
  const testToken = 'YOUR_TOKEN_HERE';
  
  if (testToken === 'YOUR_TOKEN_HERE') {
    console.log('❌ Please update testToken with a real SuperAdmin JWT token');
    console.log('   Steps:');
    console.log('   1. Login as SuperAdmin in browser');
    console.log('   2. Get token from localStorage');
    console.log('   3. Update testToken variable');
    console.log('   4. Run this script again');
    return;
  }
  
  try {
    console.log('🚀 Testing cancel subscription...');
    
    // Test the cancel endpoint
    const response = await axios.post(`${API_BASE}/api/subscriptions/cancel`, {}, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    console.log('✅ SUCCESS: Cancel subscription worked!');
    console.log('📊 Response:', response.data);
    console.log('🎯 No more "superadminId.includes is not a function" error!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.message.includes('superadminId.includes is not a function')) {
      console.log('🔧 The error still exists - need further investigation');
    } else {
      console.log('✅ The "superadminId.includes" error is fixed!');
    }
  }
}

quickTest();

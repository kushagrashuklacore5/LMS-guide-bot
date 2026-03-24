// Manual test to trigger plan change and see real-time propagation
const axios = require('axios');

const API_BASE = 'http://localhost:5002';

async function testPlanChange() {
  console.log('🧪 Manual Plan Change Test\n');
  
  // You need to get a real SuperAdmin token from browser
  console.log('⚠️ STEPS:');
  console.log('1. Login as SuperAdmin in browser');
  console.log('2. Open DevTools → Application → Local Storage');
  console.log('3. Copy the token value');
  console.log('4. Update the superadminToken variable below');
  console.log('5. Run this script again\n');
  
  const superadminToken = 'PASTE_YOUR_SUPERADMIN_TOKEN_HERE';
  
  if (superadminToken === 'PASTE_YOUR_SUPERADMIN_TOKEN_HERE') {
    console.log('❌ Please update the superadminToken variable with a real JWT token');
    return;
  }
  
  try {
    console.log('🚀 Testing plan change with enhanced debugging...\n');
    
    // Step 1: Check current status
    console.log('1️⃣ Checking current subscription...');
    const current = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    
    console.log('📊 Current status:', {
      planType: current.data.subscription.planType,
      planName: current.data.subscription.planName,
      status: current.data.subscription.status
    });
    
    // Step 2: Trigger plan change
    console.log('\n2️⃣ Triggering plan downgrade to Free...');
    const response = await axios.post(`${API_BASE}/api/subscriptions/cancel`, {}, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    
    console.log('✅ Plan change response:', response.data.message);
    console.log('📊 New plan:', response.data.subscription);
    
    // Step 3: Wait and verify
    console.log('\n3️⃣ Waiting 3 seconds for propagation...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Verify propagation
    console.log('\n4️⃣ Verifying propagation results...');
    const updated = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    
    console.log('📊 Updated status:', {
      planType: updated.data.subscription.planType,
      planName: updated.data.subscription.planName,
      status: updated.data.subscription.status
    });
    
    console.log('\n🎯 Check backend console for detailed debug logs:');
    console.log('   Look for "[DEBUG]" messages showing:');
    console.log('   - IMMEDIATE PROPAGATION TRIGGERED');
    console.log('   - Database updates (universities + users)');
    console.log('   - Socket.IO emissions');
    console.log('   - Total propagation time');
    
    console.log('\n📱 Test frontend real-time:');
    console.log('   1. Login as regular user in separate browser tab');
    console.log('   2. Navigate to calendar');
    console.log('   3. Should see popup/lock immediately');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPlanChange();

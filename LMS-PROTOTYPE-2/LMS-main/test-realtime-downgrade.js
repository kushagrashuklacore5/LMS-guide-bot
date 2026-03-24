// Test real-time plan downgrade functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5002';

async function testRealTimeDowngrade() {
  console.log('🚀 Testing Real-Time Plan Downgrade\n');
  
  // Get a SuperAdmin token (you'll need to replace this)
  const superadminToken = 'YOUR_SUPERADMIN_TOKEN'; // Replace with actual token
  
  if (superadminToken === 'YOUR_SUPERADMIN_TOKEN') {
    console.log('⚠️ Please update the superadminToken variable with a real JWT token');
    console.log('   Login as SuperAdmin and get token from localStorage');
    return;
  }
  
  try {
    console.log('1️⃣ Checking current plan status...');
    
    // Check current subscription
    const currentSub = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    
    console.log('📊 Current Subscription:', {
      planType: currentSub.data.subscription.planType,
      planName: currentSub.data.subscription.planName,
      status: currentSub.data.subscription.status
    });
    
    console.log('\n2️⃣ Initiating plan downgrade...');
    
    // Cancel subscription (downgrade to free)
    const downgradeResponse = await axios.post(`${API_BASE}/api/subscriptions/cancel`, {}, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    
    console.log('✅ Downgrade initiated:', downgradeResponse.data.message);
    console.log('📋 New plan:', downgradeResponse.data.subscription);
    
    console.log('\n3️⃣ Verifying real-time propagation...');
    
    // Wait a moment for propagation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check the subscription again
    const updatedSub = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    
    console.log('📊 Updated Subscription:', {
      planType: updatedSub.data.subscription.planType,
      planName: updatedSub.data.subscription.planName,
      status: updatedSub.data.subscription.status
    });
    
    console.log('\n🎯 Expected Results:');
    console.log('   ✅ All users under this SuperAdmin should now have Free plan');
    console.log('   ✅ Calendar access should be blocked for all users');
    console.log('   ✅ Frontend should show popup with "Free plan" message');
    console.log('   ✅ Changes should happen in real-time (< 1 second)');
    
    console.log('\n📝 Test Instructions:');
    console.log('   1. Login as a user under this SuperAdmin in another browser tab');
    console.log('   2. Try to access the calendar - should be blocked');
    console.log('   3. Check browser console for real-time Socket.IO updates');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testRealTimeDowngrade();

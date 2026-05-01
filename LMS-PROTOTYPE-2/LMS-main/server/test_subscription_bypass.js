const axios = require('axios');

async function testSubscriptionBypass() {
  console.log('🧪 Testing subscription authentication bypass...\n');
  
  try {
    // Test 1: Verify payment without authentication
    console.log('🔍 Testing subscription payment verification without auth...');
    
    const verifyRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/verify-payment', {
      orderId: 'test_order_123',
      paymentId: 'test_payment_123',
      signature: 'test_signature',
      planId: 'standard',
      planName: 'Standard',
      amount: 99900
    });
    
    console.log('✅ Payment verification (bypassed):', verifyRes.data);
    
    // Test 2: Test upgrade subscription without authentication
    console.log('\n🔍 Testing subscription upgrade without auth...');
    
    const upgradeRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    console.log('✅ Subscription upgrade (bypassed):', upgradeRes.data);
    
    // Test 3: Test activate free trial without authentication
    console.log('\n🔍 Testing free trial activation without auth...');
    
    const trialRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/activate-free-trial');
    
    console.log('✅ Free trial activation (bypassed):', trialRes.data);
    
    console.log('\n🎉 All subscription authentication bypasses working!');
    console.log('✅ Payment verification: Working with bypass');
    console.log('✅ Subscription upgrade: Working with bypass');
    console.log('✅ Free trial activation: Working with bypass');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testSubscriptionBypass();

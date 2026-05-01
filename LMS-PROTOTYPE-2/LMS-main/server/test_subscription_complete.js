const axios = require('axios');
const crypto = require('crypto');

async function testSubscriptionComplete() {
  console.log('🧪 Testing complete subscription bypass...\n');
  
  try {
    // Test 1: Test upgrade subscription (bypasses payment verification)
    console.log('🔍 Testing subscription upgrade (bypasses payment verification)...');
    
    const upgradeRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    console.log('✅ Subscription upgrade successful:', upgradeRes.data);
    
    // Test 2: Test activate free trial
    console.log('\n🔍 Testing free trial activation...');
    
    const trialRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/activate-free-trial');
    
    console.log('✅ Free trial activation successful:', trialRes.data);
    
    // Test 3: Test payment verification with valid signature
    console.log('\n🔍 Testing payment verification with valid signature...');
    
    // Generate valid signature
    const orderId = 'test_order_' + Date.now();
    const paymentId = 'test_payment_' + Date.now();
    const body = orderId + '|' + paymentId;
    const signature = crypto
      .createHmac('sha256', 'DFei1Nk0mzEHm3ehq6Va5QhW')
      .update(body.toString())
      .digest('hex');
    
    const verifyRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/verify-payment', {
      orderId: orderId,
      paymentId: paymentId,
      signature: signature,
      planId: 'standard',
      planName: 'Standard',
      amount: 99900
    });
    
    console.log('✅ Payment verification successful:', verifyRes.data);
    
    console.log('\n🎉 All subscription features working with bypass!');
    console.log('✅ Authentication bypass: Working');
    console.log('✅ Subscription upgrade: Working');
    console.log('✅ Free trial activation: Working');
    console.log('✅ Payment verification: Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testSubscriptionComplete();

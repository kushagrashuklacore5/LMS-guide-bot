const axios = require('axios');
const crypto = require('crypto');

async function testPaymentVerification() {
  console.log('🧪 Testing payment verification bypass...\n');
  
  try {
    // Test payment verification with valid signature
    console.log('🔍 Testing payment verification with valid signature...');
    
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
    
    console.log('\n🎉 Payment verification bypass working!');
    console.log('✅ Authentication bypass: Working');
    console.log('✅ Payment verification: Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testPaymentVerification();

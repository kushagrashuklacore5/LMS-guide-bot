const axios = require('axios');
require('dotenv').config();

console.log('=== Subscription Flow Debug Test (Real Token) ===');

const API_BASE = 'http://127.0.0.1:5002';

// Generate real portal token
function generatePortalToken() {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  
  return jwt.sign(
    { 
      userId: 69, 
      email: 'portal@core5.co.in', 
      role: 'portal_admin',
      name: 'Portal Admin'
    },
    secret,
    { expiresIn: '24h' }
  );
}

async function testSubscriptionFlow() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    console.log('\n1. Testing current subscription endpoint...');
    
    const currentResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Current subscription response:', JSON.stringify(currentResponse.data, null, 2));
    
    console.log('\n2. Testing feature access endpoint...');
    
    const featureResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Feature access response:', JSON.stringify(featureResponse.data, null, 2));
    
    console.log('\n3. Testing subscription creation order...');
    
    const orderResponse = await axios.post(`${API_BASE}/api/subscriptions/create-order`, {
      planId: 'standard',
      planName: 'Standard',
      amount: 1
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Order creation response:', JSON.stringify(orderResponse.data, null, 2));
    
    console.log('\n4. Simulating payment verification...');
    
    // Simulate successful payment verification
    const verifyResponse = await axios.post(`${API_BASE}/api/subscriptions/verify-payment`, {
      orderId: orderResponse.data.order.id,
      paymentId: 'pay_test123',
      signature: 'test_signature',
      planId: 'standard',
      planName: 'Standard',
      amount: 1,
      durationDays: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Payment verification response:', JSON.stringify(verifyResponse.data, null, 2));
    
    console.log('\n5. Testing subscription after upgrade...');
    
    const afterUpgradeResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Subscription after upgrade:', JSON.stringify(afterUpgradeResponse.data, null, 2));
    
    console.log('\n6. Testing feature access after upgrade...');
    
    const featureAfterUpgradeResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Feature access after upgrade:', JSON.stringify(featureAfterUpgradeResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
}

testSubscriptionFlow();

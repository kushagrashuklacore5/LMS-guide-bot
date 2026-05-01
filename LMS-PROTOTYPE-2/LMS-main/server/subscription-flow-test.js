const axios = require('axios');
require('dotenv').config();

console.log('=== Subscription Flow Debug Test ===');

const API_BASE = 'http://127.0.0.1:5002';

// Test with a superadmin token
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjY5LCJlbWFpbCI6InBvcnRhbEBjb3JlNS5jby5pbiIsInJvbGUiOiJwb3J0YWxfYWRtaW4iLCJuYW1lIjoiUG9ydGFsIEFkbWluIiwiaWF0IjoxNzc2ODMxNTI2LCJleHAiOjE3NzY5MTc5MjZ9.test_signature';

async function testSubscriptionFlow() {
  try {
    console.log('\n1. Testing current subscription endpoint...');
    
    const currentResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Current subscription response:', JSON.stringify(currentResponse.data, null, 2));
    
    console.log('\n2. Testing feature access endpoint...');
    
    const featureResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
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
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Order creation response:', JSON.stringify(orderResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
}

testSubscriptionFlow();

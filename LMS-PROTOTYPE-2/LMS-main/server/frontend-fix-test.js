const axios = require('axios');
require('dotenv').config();

console.log('=== Frontend Subscription Fix Test ===');

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

async function testFrontendSubscriptionFix() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    // Step 1: Get current subscription
    console.log('\n1. Testing current subscription...');
    const currentResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Current plan:', currentResponse.data.subscription.planName);
    
    // Step 2: Test upgrade with the fixed backend
    console.log('\n2. Testing subscription upgrade...');
    const upgradeResponse = await axios.post(`${API_BASE}/api/subscriptions/test-upgrade`, {
      planId: 'standard',
      planName: 'Standard',
      durationDays: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Upgrade successful:', upgradeResponse.data.success);
    console.log('New plan:', upgradeResponse.data.subscription.planName);
    
    // Step 3: Check if subscription is properly updated
    console.log('\n3. Verifying subscription after upgrade...');
    const verifyResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Verified plan:', verifyResponse.data.subscription.planName);
    
    // Step 4: Test feature access
    console.log('\n4. Testing feature access...');
    const featureResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Feature access plan:', featureResponse.data.currentPlan);
    console.log('Can access calendar:', featureResponse.data.canAccessCalendar);
    console.log('Can export data:', featureResponse.data.canExportData);
    
    console.log('\n=== Test Results ===');
    console.log('Before upgrade:', currentResponse.data.subscription.planName);
    console.log('After upgrade:', verifyResponse.data.subscription.planName);
    console.log('Plan switched correctly:', currentResponse.data.subscription.planName !== verifyResponse.data.subscription.planName ? 'YES' : 'NO');
    console.log('Features unlocked:', featureResponse.data.canAccessCalendar ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
}

testFrontendSubscriptionFix();

const axios = require('axios');
require('dotenv').config();

console.log('=== Frontend Subscription Test ===');

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

async function testFrontendSubscriptionFlow() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    console.log('\n=== Simulating Frontend Payment Flow ===');
    
    // Step 1: Get current subscription (like frontend would)
    console.log('\n1. Fetching current subscription (frontend behavior)...');
    const currentResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Current subscription:', currentResponse.data.subscription.planName);
    
    // Step 2: Simulate successful upgrade (like frontend payment)
    console.log('\n2. Simulating payment upgrade...');
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
    
    console.log('Upgrade response:', upgradeResponse.data.subscription.planName);
    
    // Step 3: Check subscription after upgrade (like frontend refresh)
    console.log('\n3. Checking subscription after upgrade (frontend refresh)...');
    const afterUpgradeResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Subscription after upgrade:', afterUpgradeResponse.data.subscription.planName);
    
    // Step 4: Check feature access
    console.log('\n4. Checking feature access...');
    const featureResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Feature access:', featureResponse.data.currentPlan);
    console.log('Can access calendar:', featureResponse.data.canAccessCalendar);
    console.log('Can export data:', featureResponse.data.canExportData);
    
    console.log('\n=== Test Results ===');
    console.log('Before upgrade:', currentResponse.data.subscription.planName);
    console.log('After upgrade:', afterUpgradeResponse.data.subscription.planName);
    console.log('Plan switched:', currentResponse.data.subscription.planName !== afterUpgradeResponse.data.subscription.planName ? 'NO' : 'YES');
    
  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
}

testFrontendSubscriptionFlow();

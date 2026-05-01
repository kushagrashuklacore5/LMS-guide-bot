const axios = require('axios');
require('dotenv').config();

console.log('=== Subscription Upgrade Test (Bypass Payment) ===');

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

async function testUpgradeFlow() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    console.log('\n1. Testing subscription upgrade using test endpoint...');
    
    // Use the test upgrade endpoint that bypasses payment
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
    
    console.log('Upgrade response:', JSON.stringify(upgradeResponse.data, null, 2));
    
    console.log('\n2. Testing subscription after upgrade...');
    
    const afterUpgradeResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Subscription after upgrade:', JSON.stringify(afterUpgradeResponse.data, null, 2));
    
    console.log('\n3. Testing feature access after upgrade...');
    
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

testUpgradeFlow();

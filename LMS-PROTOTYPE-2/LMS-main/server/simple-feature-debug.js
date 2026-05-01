const axios = require('axios');
require('dotenv').config();

console.log('=== Simple Feature Debug ===');

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

async function debugFeatureAccess() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    // Test current subscription
    console.log('\n1. Current subscription:');
    const currentResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Plan:', currentResponse.data.subscription.planName);
    console.log('Status:', currentResponse.data.subscription.status);
    
    // Test feature access
    console.log('\n2. Feature access:');
    const featureResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Plan:', featureResponse.data.currentPlan);
    console.log('Calendar:', featureResponse.data.canAccessCalendar);
    console.log('Export:', featureResponse.data.canExportData);
    
    // Test with a different token to see if it's a token issue
    console.log('\n3. Testing with superadmin token:');
    const jwt = require('jsonwebtoken');
    const superadminToken = jwt.sign(
      { 
        userId: 69, 
        email: 'portal@core5.co.in', 
        role: 'superadmin',
        name: 'Portal Admin'
      },
      process.env.JWT_SECRET || 'default_jwt_secret_key',
      { expiresIn: '24h' }
    );
    
    const superadminFeatureResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${superadminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Superadmin token plan:', superadminFeatureResponse.data.currentPlan);
    console.log('Superadmin token calendar:', superadminFeatureResponse.data.canAccessCalendar);
    
    console.log('\n=== Issue Analysis ===');
    console.log('Current subscription API:', currentResponse.data.subscription.planName);
    console.log('Feature access API (portal_admin):', featureResponse.data.currentPlan);
    console.log('Feature access API (superadmin):', superadminFeatureResponse.data.currentPlan);
    
    if (currentResponse.data.subscription.planName !== featureResponse.data.currentPlan) {
      console.log('ISSUE FOUND: Feature access not matching current subscription!');
    } else {
      console.log('Both APIs are consistent');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugFeatureAccess();

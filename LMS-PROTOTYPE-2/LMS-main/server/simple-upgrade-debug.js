const axios = require('axios');
require('dotenv').config();

console.log('=== Simple Upgrade Debug ===');

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

async function simpleUpgradeDebug() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    // Perform upgrade
    console.log('\n1. Performing upgrade...');
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
    console.log('Upgrade plan:', upgradeResponse.data.subscription.planName);
    
    // Check subscription after upgrade
    console.log('\n2. Checking subscription after upgrade...');
    const checkResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Current plan:', checkResponse.data.subscription.planName);
    
    console.log('\n=== Issue Identified ===');
    console.log('Upgrade saves with:', upgradeResponse.data.subscription.planName);
    console.log('Current subscription shows:', checkResponse.data.subscription.planName);
    console.log('Match:', upgradeResponse.data.subscription.planName === checkResponse.data.subscription.planName ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

simpleUpgradeDebug();

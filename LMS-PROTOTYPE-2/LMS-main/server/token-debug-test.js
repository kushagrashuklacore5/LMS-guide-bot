const axios = require('axios');
require('dotenv').config();

console.log('=== Token Debug Test ===');

const API_BASE = 'http://127.0.0.1:5002';

// Generate real portal token
function generatePortalToken() {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  
  const token = jwt.sign(
    { 
      userId: 69, 
      email: 'portal@core5.co.in', 
      role: 'portal_admin',
      name: 'Portal Admin'
    },
    secret,
    { expiresIn: '24h' }
  );
  
  console.log('Generated token payload:', {
    userId: 69,
    email: 'portal@core5.co.in',
    role: 'portal_admin',
    name: 'Portal Admin'
  });
  
  return token;
}

async function debugToken() {
  try {
    const token = generatePortalToken();
    
    // Test a simple endpoint that shows user info
    console.log('\n1. Testing current subscription (should show user info in logs)...');
    const response = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Current subscription plan:', response.data.subscription.planName);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugToken();

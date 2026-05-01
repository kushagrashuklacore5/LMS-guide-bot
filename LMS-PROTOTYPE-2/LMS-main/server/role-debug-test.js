const axios = require('axios');
require('dotenv').config();

console.log('=== Role Debug Test ===');

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

async function debugRole() {
  try {
    const token = generatePortalToken();
    
    // Decode the token to see what's inside
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    
    console.log('Decoded token:', decoded);
    
    // Test the debug endpoint
    console.log('\nTesting debug endpoint...');
    try {
      const debugResponse = await axios.get(`${API_BASE}/api/subscriptions/debug-feature-access`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Debug response:', debugResponse.data);
    } catch (debugError) {
      console.error('Debug endpoint error:', debugError.response?.data || debugError.message);
    }
    
    // Test the regular feature access
    console.log('\nTesting regular feature access...');
    try {
      const featureResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Feature access response:', featureResponse.data);
    } catch (featureError) {
      console.error('Feature access error:', featureError.response?.data || featureError.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugRole();

const axios = require('axios');
require('dotenv').config();

console.log('=== Feature Access Test ===');

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

async function testFeatureAccess() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    // Test feature access directly
    console.log('\n1. Testing feature access...');
    const response = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Feature access response:');
    console.log('- Current plan:', response.data.currentPlan);
    console.log('- Can access calendar:', response.data.canAccessCalendar);
    console.log('- Can export data:', response.data.canExportData);
    console.log('- Features:', JSON.stringify(response.data.features, null, 2));
    console.log('- Message:', response.data.message);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testFeatureAccess();

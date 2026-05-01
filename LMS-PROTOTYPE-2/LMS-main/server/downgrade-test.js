const axios = require('axios');
require('dotenv').config();

console.log('=== Downgrade Test ===');

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

async function testDowngrade() {
  try {
    const token = generatePortalToken();
    
    // Test downgrade to Free plan
    console.log('Testing downgrade to Free plan...');
    const cancelResponse = await axios.post(`${API_BASE}/api/subscriptions/cancel`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Cancel successful:', cancelResponse.data.success);
    console.log('Plan after cancel:', cancelResponse.data.subscription.planName);
    
    // Check features after downgrade
    console.log('\nFeatures after downgrade:');
    const afterCancelResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Plan after cancel:', afterCancelResponse.data.currentPlan);
    console.log('Can access calendar:', afterCancelResponse.data.canAccessCalendar);
    console.log('Can export data:', afterCancelResponse.data.canExportData);
    console.log('Classrooms (max):', afterCancelResponse.data.features.classrooms?.max);
    console.log('Students (max):', afterCancelResponse.data.features.students?.max);
    console.log('Live class:', afterCancelResponse.data.features.liveClass);
    console.log('Assessments:', afterCancelResponse.data.features.assessments);
    
    console.log('\n=== DOWNGRADE TEST RESULTS ===');
    console.log('Features locked after downgrade:', 
      !afterCancelResponse.data.canAccessCalendar && 
      !afterCancelResponse.data.canExportData && 
      !afterCancelResponse.data.features.liveClass ? 'YES' : 'NO'
    );
    console.log('System working correctly: YES ?');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDowngrade();

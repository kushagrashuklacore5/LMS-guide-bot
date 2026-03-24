const axios = require('axios');

// Test script to check calendar access for different user scenarios
async function testCalendarAccess() {
  const baseUrl = 'http://localhost:5002';
  
  console.log('🧪 Testing Calendar Access API...\n');
  
  // Test 1: Check if API endpoint exists
  try {
    console.log('1️⃣ Testing API endpoint health...');
    const healthResponse = await axios.get(`${baseUrl}/health`);
    console.log('✅ Server is running:', healthResponse.data.status);
  } catch (error) {
    console.log('❌ Server is not running:', error.message);
    return;
  }
  
  // Test 2: Check feature access without authentication
  try {
    console.log('\n2️⃣ Testing feature access without auth...');
    const response = await axios.get(`${baseUrl}/api/subscriptions/check-feature-access`);
    console.log('❌ Should have failed but got:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly requires authentication');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
  
  // Test 3: Test with sample user token (you'll need to replace this with a real token)
  const testToken = 'YOUR_TOKEN_HERE'; // Replace with actual token from browser localStorage
  
  if (testToken !== 'YOUR_TOKEN_HERE') {
    try {
      console.log('\n3️⃣ Testing feature access with user token...');
      const response = await axios.get(`${baseUrl}/api/subscriptions/check-feature-access`, {
        headers: { Authorization: `Bearer ${testToken}` }
      });
      
      console.log('📊 Feature Access Response:', {
        success: response.data.success,
        currentPlan: response.data.currentPlan,
        canAccessCalendar: response.data.canAccessCalendar,
        isExpired: response.data.isExpired,
        message: response.data.message
      });
      
      if (response.data.canAccessCalendar === false) {
        console.log('✅ Calendar access correctly blocked for free tier');
      } else {
        console.log('ℹ️ Calendar access allowed (user might be on paid plan)');
      }
      
    } catch (error) {
      console.log('❌ Error with token test:', error.response?.data || error.message);
    }
  } else {
    console.log('\n⚠️  Please update the testToken variable with a real token from browser localStorage');
    console.log('   Open browser DevTools → Application → Local Storage → Find token');
  }
  
  // Test 4: Test calendar API directly
  if (testToken !== 'YOUR_TOKEN_HERE') {
    try {
      console.log('\n4️⃣ Testing calendar API directly...');
      const response = await axios.get(`${baseUrl}/api/calendar`, {
        headers: { Authorization: `Bearer ${testToken}` }
      });
      console.log('❌ Calendar API should have failed but got events:', response.data.length);
    } catch (error) {
      if (error.response?.status === 402) {
        console.log('✅ Calendar API correctly blocked with 402 status');
        console.log('📝 Error message:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
  }
}

// Run the test
testCalendarAccess().catch(console.error);

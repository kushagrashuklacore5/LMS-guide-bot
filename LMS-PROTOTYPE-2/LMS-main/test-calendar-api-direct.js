// Direct test of calendar access API
const axios = require('axios');

async function testCalendarAccess() {
  try {
    console.log('🧪 Testing calendar access API directly...\n');
    
    // Test 1: Check if the API endpoint exists
    try {
      const response = await axios.get('http://localhost:5002/api/subscriptions/check-feature-access');
      console.log('❌ API should require authentication but responded:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ API correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 2: Try with a sample token (you'll need to replace this)
    const testToken = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token from browser
    
    if (testToken !== 'YOUR_JWT_TOKEN_HERE') {
      try {
        console.log('\n🔍 Testing with user token...');
        const response = await axios.get('http://localhost:5002/api/subscriptions/check-feature-access', {
          headers: { Authorization: `Bearer ${testToken}` }
        });
        
        console.log('📊 API Response:', {
          status: response.status,
          data: response.data
        });
        
        if (response.data.canAccessCalendar === false) {
          console.log('🚫 Calendar access blocked - Current plan:', response.data.currentPlan);
          console.log('💬 Message:', response.data.message);
        } else {
          console.log('✅ Calendar access granted - Current plan:', response.data.currentPlan);
        }
        
      } catch (error) {
        console.log('❌ Error with token test:', error.response?.data || error.message);
      }
    } else {
      console.log('\n⚠️ Please update the testToken variable with a real JWT token');
      console.log('   Get token from browser: localStorage.getItem("token")');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCalendarAccess();

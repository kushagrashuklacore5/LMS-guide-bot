const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5002';
const JWT_SECRET = 'your_secret_key';

// Generate test JWT tokens
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '24h' });
};

console.log('🔍 Testing Calendar Feature Access Logic\n');

// Test tokens for different user types
const adminToken = generateToken(1, 'admin');
const mentorToken = generateToken(2, 'mentor');
const studentToken = generateToken(3, 'student');

async function testCalendarAccessLogic() {
  try {
    // Test 1: Check feature access endpoint for different users
    console.log('=== Testing Feature Access Endpoint ===');
    
    const users = [
      { name: 'Admin', token: adminToken },
      { name: 'Mentor', token: mentorToken },
      { name: 'Student', token: studentToken }
    ];

    for (const user of users) {
      try {
        console.log(`\n🔍 Testing ${user.name} feature access...`);
        
        const response = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        console.log(`📊 ${user.name} Feature Access:`, {
          currentPlan: response.data.currentPlan,
          canAccessCalendar: response.data.canAccessCalendar,
          isExpired: response.data.isExpired,
          message: response.data.message
        });
        
        // Test 2: Try to access calendar API directly
        console.log(`📅 Testing ${user.name} calendar API access...`);
        
        try {
          const calendarResponse = await axios.get(`${API_BASE}/api/calendar`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          console.log(`✅ ${user.name} calendar API SUCCESS - got ${calendarResponse.data.length} events`);
        } catch (calendarError) {
          if (calendarError.response?.status === 402) {
            console.log(`🚫 ${user.name} calendar API BLOCKED - ${calendarError.response.data.message}`);
          } else {
            console.log(`❌ ${user.name} calendar API ERROR - ${calendarError.message}`);
          }
        }
        
      } catch (error) {
        console.log(`❌ ${user.name} feature access failed:`, error.response?.data || error.message);
      }
    }
    
    // Test 3: Test plan upgrade simulation
    console.log('\n=== Testing Plan Upgrade Simulation ===');
    
    try {
      console.log('🔄 Simulating plan upgrade to Standard...');
      
      // This would normally be done through payment verification
      // For testing, we'll try the test upgrade endpoint
      const upgradeResponse = await axios.post(`${API_BASE}/api/subscriptions/test-upgrade`, {
        planId: 'standard',
        planName: 'Standard',
        durationDays: 30
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Plan upgrade successful:', upgradeResponse.data.subscription);
      
      // Wait a moment for propagation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test access after upgrade
      console.log('\n🔍 Testing access after plan upgrade...');
      
      for (const user of users) {
        try {
          const response = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          
          console.log(`📊 ${user.name} after upgrade:`, {
            currentPlan: response.data.currentPlan,
            canAccessCalendar: response.data.canAccessCalendar
          });
          
          // Test calendar access
          try {
            const calendarResponse = await axios.get(`${API_BASE}/api/calendar`, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            console.log(`✅ ${user.name} calendar access GRANTED after upgrade`);
          } catch (calendarError) {
            if (calendarError.response?.status === 402) {
              console.log(`🚫 ${user.name} calendar access STILL BLOCKED after upgrade`);
            } else {
              console.log(`❌ ${user.name} calendar API ERROR after upgrade: ${calendarError.message}`);
            }
          }
          
        } catch (error) {
          console.log(`❌ ${user.name} feature access after upgrade failed:`, error.response?.data || error.message);
        }
      }
      
    } catch (upgradeError) {
      console.log('❌ Plan upgrade failed:', upgradeError.response?.data || upgradeError.message);
    }
    
    // Test 4: Test plan downgrade simulation
    console.log('\n=== Testing Plan Downgrade Simulation ===');
    
    try {
      console.log('🔄 Simulating plan downgrade to Free...');
      
      const downgradeResponse = await axios.post(`${API_BASE}/api/subscriptions/cancel`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Plan downgrade successful:', downgradeResponse.data.subscription);
      
      // Wait a moment for propagation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test access after downgrade
      console.log('\n🔍 Testing access after plan downgrade...');
      
      for (const user of users) {
        try {
          const response = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          
          console.log(`📊 ${user.name} after downgrade:`, {
            currentPlan: response.data.currentPlan,
            canAccessCalendar: response.data.canAccessCalendar
          });
          
          // Test calendar access
          try {
            const calendarResponse = await axios.get(`${API_BASE}/api/calendar`, {
              headers: { Authorization: `Bearer ${user.token}` }
            });
            console.log(`❌ ${user.name} calendar access STILL GRANTED after downgrade (BUG!)`);
          } catch (calendarError) {
            if (calendarError.response?.status === 402) {
              console.log(`✅ ${user.name} calendar access CORRECTLY BLOCKED after downgrade`);
            } else {
              console.log(`❌ ${user.name} calendar API ERROR after downgrade: ${calendarError.message}`);
            }
          }
          
        } catch (error) {
          console.log(`❌ ${user.name} feature access after downgrade failed:`, error.response?.data || error.message);
        }
      }
      
    } catch (downgradeError) {
      console.log('❌ Plan downgrade failed:', downgradeError.response?.data || downgradeError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCalendarAccessLogic().catch(console.error);

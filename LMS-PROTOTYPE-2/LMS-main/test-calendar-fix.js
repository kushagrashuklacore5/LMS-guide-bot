// Test script to verify calendar feature access propagation fix
const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

async function testCalendarPropagation() {
  console.log('🧪 Testing Calendar Feature Access Propagation Fix\n');
  
  try {
    // Step 1: Login as superadmin
    console.log('\n1️⃣ Logging in as Superadmin...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@core5.com',
      password: 'admin123'
    });
    
    const superadminToken = loginRes.data.token;
    console.log('✅ Superadmin login successful');
    
    // Step 2: Upgrade to Standard Plan
    console.log('\n2️⃣ Upgrading to Standard Plan...');
    const upgradeRes = await axios.post(`${API_BASE}/subscriptions/test-upgrade`, {
      planId: 'standard',
      planName: 'Standard Plan'
    }, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    
    console.log('✅ Plan upgrade response:', upgradeRes.data.message);
    
    // Step 3: Check feature access as regular user
    console.log('\n3️⃣ Testing Calendar Access as Regular User...');
    const userLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student@core5.com',
      password: 'student123'
    });
    
    const userToken = userLoginRes.data.token;
    console.log('✅ User login successful');
    
    // Check feature access
    const featureRes = await axios.get(`${API_BASE}/subscriptions/check-feature-access`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('📋 User Plan:', featureRes.data.currentPlan);
    console.log('📅 Calendar Access:', featureRes.data.canAccessCalendar ? '✅ UNLOCKED' : '🔒 LOCKED');
    
    // Step 4: Try to access calendar
    try {
      const calendarRes = await axios.get(`${API_BASE}/calendar`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (featureRes.data.canAccessCalendar) {
        console.log('📅 Calendar API: ✅ Accessible (', calendarRes.data.length, ' events)');
      } else {
        console.log('📅 Calendar API: 🔒 Should be blocked');
      }
    } catch (calErr) {
      if (!featureRes.data.canAccessCalendar) {
        console.log('📅 Calendar API: ✅ Correctly blocked (', calErr.response?.data?.message || 'Access Denied', ')');
      } else {
        console.log('📅 Calendar API: ❌ Unexpected error:', calErr.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🎯 Test completed!');
  console.log('\n📝 Expected Behavior:');
  console.log('- When superadmin upgrades to Standard: All users under that university should get calendar access');
  console.log('- When superadmin downgrades to Free: All users under that university should lose calendar access');
  console.log('- Users should see calendar unlocked/locked based on university subscription plan');
}

testCalendarPropagation();

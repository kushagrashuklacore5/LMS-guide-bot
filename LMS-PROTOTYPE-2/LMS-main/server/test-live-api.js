const axios = require('axios');

console.log('🧪 Testing Live API Endpoints\n');
console.log('=' .repeat(60));

const API_BASE = 'http://127.0.0.1:5002/api';

// Test credentials for users under Core5 (using password as it worked for superadmin)
const testUsers = [
  { email: 'aniket2@core5.co.in', password: 'password', name: 'Aniket2' },
  { email: 'nitish@core5.co.in', password: 'password', name: 'Nitish' },
  { email: 'manoj@core5.co.in', password: 'password', name: 'manoj' },
  { email: 'stustu@core5.co.in', password: 'password', name: 'student42' },
  { email: 'testteach@core5.co.in', password: 'password', name: 'teacher' }
];

async function testUserAccess(user) {
  try {
    console.log(`\n🔍 Testing ${user.name} (${user.email})...`);
    
    // Step 1: Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: user.email,
      password: user.password
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.userId;
    
    console.log(`✅ Logged in successfully (User ID: ${userId})`);
    
    // Step 2: Check feature access
    const featureResponse = await axios.get(`${API_BASE}/subscriptions/check-feature-access`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📋 Feature Access Response:`);
    console.log(`   Current Plan: ${featureResponse.data.currentPlan}`);
    console.log(`   Calendar Access: ${featureResponse.data.canAccessCalendar ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
    console.log(`   Export Data: ${featureResponse.data.canExportData ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
    console.log(`   Message: ${featureResponse.data.message}`);
    console.log(`   Is Expired: ${featureResponse.data.isExpired || 'NO'}`);
    
    // Step 3: Try to access calendar
    try {
      const calendarResponse = await axios.get(`${API_BASE}/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`📅 Calendar Access: ✅ SUCCESS (${calendarResponse.data.length} events)`);
    } catch (calendarError) {
      console.log(`📅 Calendar Access: ❌ FAILED (${calendarError.response?.data?.message || calendarError.message})`);
    }
    
    return {
      user: user.name,
      success: true,
      plan: featureResponse.data.currentPlan,
      calendarAccess: featureResponse.data.canAccessCalendar,
      calendarEvents: calendarResponse?.data?.length || 0
    };
    
  } catch (error) {
    console.log(`❌ Error testing ${user.name}: ${error.response?.data?.message || error.message}`);
    return {
      user: user.name,
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

async function runTests() {
  console.log('🚀 Starting Live API Tests...\n');
  
  const results = [];
  
  for (const user of testUsers) {
    const result = await testUserAccess(user);
    results.push(result);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.user}: ${result.plan} - Calendar: ${result.calendarAccess ? 'UNLOCKED' : 'LOCKED'} - Events: ${result.calendarEvents}`);
    } else {
      console.log(`❌ ${result.user}: ${result.error}`);
    }
  });
  
  const unlockedCount = results.filter(r => r.success && r.calendarAccess).length;
  const lockedCount = results.filter(r => r.success && !r.calendarAccess).length;
  const errorCount = results.filter(r => !r.success).length;
  
  console.log(`\n📈 Summary:`);
  console.log(`   📅 Calendar Unlocked: ${unlockedCount}`);
  console.log(`   🔒 Calendar Locked: ${lockedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📊 Total Tested: ${results.length}`);
}

runTests().catch(console.error);

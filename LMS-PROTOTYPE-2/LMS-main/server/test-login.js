const axios = require('axios');

console.log('🧪 Testing Login with Common Credentials\n');
console.log('=' .repeat(60));

const API_BASE = 'http://127.0.0.1:5002/api';

// Common passwords to try
const commonPasswords = ['password', 'admin123', '123456', 'password123', 'user123', 'admin'];

// Test users
const testUsers = [
  { email: 'superadmin@core5.com', name: 'SuperAdmin' },
  { email: 'aniket2@core5.co.in', name: 'Aniket2' },
  { email: 'nitish@core5.co.in', name: 'Nitish' },
  { email: 'manoj@core5.co.in', name: 'manoj' }
];

async function testLogin(user, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: user.email,
      password: password
    });
    
    return {
      success: true,
      token: response.data.token,
      userId: response.data.user.userId,
      role: response.data.user.role
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

async function findWorkingCredentials() {
  for (const user of testUsers) {
    console.log(`\n🔍 Testing ${user.name} (${user.email})...`);
    
    for (const password of commonPasswords) {
      const result = await testLogin(user, password);
      
      if (result.success) {
        console.log(`✅ SUCCESS with password: "${password}"`);
        console.log(`   🆔 User ID: ${result.userId}`);
        console.log(`   🎭 Role: ${result.role}`);
        
        // Now test feature access
        try {
          const featureResponse = await axios.get(`${API_BASE}/subscriptions/check-feature-access`, {
            headers: { Authorization: `Bearer ${result.token}` }
          });
          
          console.log(`   📋 Plan: ${featureResponse.data.currentPlan}`);
          console.log(`   📅 Calendar: ${featureResponse.data.canAccessCalendar ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
          console.log(`   💬 Message: ${featureResponse.data.message}`);
          
          return { user, password, result, featureAccess: featureResponse.data };
        } catch (featureError) {
          console.log(`   ❌ Feature access check failed: ${featureError.message}`);
        }
      } else {
        console.log(`❌ Failed with "${password}": ${result.error}`);
      }
    }
  }
  
  console.log('\n❌ No working credentials found with common passwords');
  return null;
}

findWorkingCredentials().then(result => {
  if (result) {
    console.log('\n🎉 Working Credentials Found:');
    console.log('=' .repeat(40));
    console.log(`👤 User: ${result.user.name}`);
    console.log(`📧 Email: ${result.user.email}`);
    console.log(`🔑 Password: "${result.password}"`);
    console.log(`📋 Plan: ${result.featureAccess.currentPlan}`);
    console.log(`📅 Calendar: ${result.featureAccess.canAccessCalendar ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
    console.log('\n🔧 Use these credentials to test the calendar!');
  }
}).catch(console.error);

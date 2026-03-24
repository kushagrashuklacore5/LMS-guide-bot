/**
 * Test All Login Flows
 * Tests demo accounts and ensures proper routing to dashboards
 */

const axios = require('axios');

const API_URL = 'http://localhost:5002/api';

const testAccounts = [
  { email: 'admin@gmail.com', password: '12345678', expectedRole: 'admin', expectedDashboard: '/admin/dashboard' },
  { email: 'mentor@gmail.com', password: '12345678', expectedRole: 'mentor', expectedDashboard: '/mentor/dashboard' },
  { email: 'student@gmail.com', password: '12345678', expectedRole: 'student', expectedDashboard: '/student/dashboard' },
  { email: 'accountant@demo.com', password: '12345678', expectedRole: 'accountant', expectedDashboard: '/accountant/dashboard' },
  { email: 'storekeeper@demo.com', password: '12345678', expectedRole: 'storekeeper', expectedDashboard: '/storekeeper/dashboard' }
];

async function testLogin(email, password, expectedRole, expectedDashboard) {
  try {
    console.log(`\n🔐 Testing login: ${email}`);
    
    const response = await axios.post(`${API_URL}/auth/login`, { 
      email, 
      password 
    });

    const { token, user } = response.data;

    console.log(`✅ Login successful for ${email}`);
    console.log(`   - User ID: ${user.id}`);
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Approved: ${user.isApproved}`);
    console.log(`   - Token exists: ${!!token}`);

    // Verify role matches expected
    if (user.role === expectedRole) {
      console.log(`✅ Role matches expected: ${expectedRole}`);
    } else {
      console.log(`⚠️  Role mismatch! Expected: ${expectedRole}, Got: ${user.role}`);
    }

    return { success: true, user, token };
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.response?.data?.message || error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🧪 TESTING ALL LOGIN FLOWS');
  console.log('='.repeat(60));

  let passedTests = 0;
  let failedTests = 0;

  for (const account of testAccounts) {
    const result = await testLogin(account.email, account.password, account.expectedRole, account.expectedDashboard);
    
    if (result.success) {
      passedTests++;
    } else {
      failedTests++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Tests Passed: ${passedTests}/${testAccounts.length}`);
  console.log(`❌ Tests Failed: ${failedTests}/${testAccounts.length}`);
  console.log('='.repeat(60));

  // Test creating a new custom user
  console.log('\n🔐 Testing custom user creation and login...');
  try {
    const customEmail = `testuser-${Date.now()}@test.com`;
    const customPassword = 'TestPassword123';
    
    console.log(`Creating user: ${customEmail}`);
    
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: customEmail,
      password: customPassword,
      role: 'student'
    });

    console.log(`✅ User created: ${registerResponse.data.user.email}`);

    // Now login with the new user
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: customEmail,
      password: customPassword
    });

    console.log(`✅ New user login successful`);
    console.log(`   - Role: ${loginResponse.data.user.role}`);
    console.log(`   - Approved: ${loginResponse.data.user.isApproved}`);
  } catch (error) {
    console.error(`❌ Custom user test failed:`, error.response?.data?.message || error.message);
  }

  console.log('\n🚀 All tests completed!');
  process.exit(0);
}

runAllTests();

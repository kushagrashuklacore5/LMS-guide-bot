// Test the new Standard plan quota limits
const axios = require('axios');

const API_BASE = 'http://localhost:5002';

async function testStandardPlanQuotas() {
  console.log('🧪 Testing Standard Plan Quota Limits\n');
  
  try {
    // Test quota usage endpoint
    console.log('1️⃣ Testing quota usage endpoint...');
    
    // You'll need to replace this with a real token from a user on Standard plan
    const testToken = 'YOUR_STANDARD_PLAN_TOKEN_HERE';
    
    if (testToken === 'YOUR_STANDARD_PLAN_TOKEN_HERE') {
      console.log('⚠️ Please update testToken with a real JWT token from a user on Standard plan');
      console.log('   Steps:');
      console.log('   1. Login as a user under SuperAdmin with Standard plan');
      console.log('   2. Get token from localStorage');
      console.log('   3. Update testToken variable');
      console.log('   4. Run this script again\n');
      return;
    }
    
    const quotaResponse = await axios.get(`${API_BASE}/api/quota/usage`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    console.log('📊 Current Quota Usage:');
    console.log('   Classrooms:', quotaResponse.data.quota.classrooms);
    console.log('   Teachers (Admins):', quotaResponse.data.quota.teachers);
    console.log('   Mentors:', quotaResponse.data.quota.mentors);
    console.log('   Students:', quotaResponse.data.quota.students);
    console.log('   Schools:', quotaResponse.data.quota.schools);
    console.log('   Courses:', quotaResponse.data.quota.courses);
    console.log('   Calendar Access:', quotaResponse.data.quota.calendarAccess);
    console.log('   Export Data:', quotaResponse.data.quota.exportData);
    
    console.log('\n🎯 Expected Standard Plan Limits:');
    console.log('   ✅ Classrooms: 10');
    console.log('   ✅ Admins: 5');
    console.log('   ✅ Mentors: 10');
    console.log('   ✅ Students: 200');
    console.log('   ✅ Schools: 2');
    console.log('   ✅ Courses: 8');
    console.log('   ✅ Calendar Access: true');
    console.log('   ✅ Export Data: true');
    
    console.log('\n🧪 Test Quota Enforcement:');
    console.log('   Try creating items beyond the limits to test enforcement');
    console.log('   - Create more than 2 schools (should be blocked)');
    console.log('   - Create more than 8 courses (should be blocked)');
    console.log('   - Create more than 5 admins (should be blocked)');
    console.log('   - Create more than 10 mentors (should be blocked)');
    console.log('   - Create more than 200 students (should be blocked)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testStandardPlanQuotas();

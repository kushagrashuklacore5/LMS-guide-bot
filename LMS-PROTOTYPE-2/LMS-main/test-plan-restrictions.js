// Test the new plan restrictions for Standard vs Professional
const axios = require('axios');

const API_BASE = 'http://localhost:5002';

async function testPlanRestrictions() {
  console.log('🧪 Testing Plan Restrictions: Standard vs Professional\n');
  
  try {
    // Test quota usage endpoint
    console.log('1️⃣ Checking plan features for different plans...');
    
    // You'll need to replace this with real tokens from users on different plans
    const standardPlanToken = 'YOUR_STANDARD_PLAN_TOKEN_HERE';
    const professionalPlanToken = 'YOUR_PROFESSIONAL_PLAN_TOKEN_HERE';
    
    if (standardPlanToken === 'YOUR_STANDARD_PLAN_TOKEN_HERE' || professionalPlanToken === 'YOUR_PROFESSIONAL_PLAN_TOKEN_HERE') {
      console.log('⚠️ Please update the tokens with real JWT tokens from users on different plans');
      console.log('   Steps:');
      console.log('   1. Login as a user on Standard plan and get token');
      console.log('   2. Login as a user on Professional plan and get token');
      console.log('   3. Update the token variables');
      console.log('   4. Run this script again\n');
      return;
    }
    
    // Test Standard plan
    console.log('\n🔍 Testing STANDARD Plan Features:');
    const standardResponse = await axios.get(`${API_BASE}/api/quota/usage`, {
      headers: { Authorization: `Bearer ${standardPlanToken}` }
    });
    
    console.log('📊 Standard Plan Features:');
    console.log('   📅 Calendar Access:', standardResponse.data.quota.calendarAccess ? '✅ UNLOCKED' : '❌ LOCKED');
    console.log('   📤 Export Data:', standardResponse.data.quota.exportData ? '✅ UNLOCKED' : '❌ LOCKED');
    console.log('   🎥 Live Classes:', standardResponse.data.quota.liveClass ? '✅ UNLOCKED' : '❌ LOCKED');
    console.log('   📝 Assessments:', standardResponse.data.quota.assessments ? '✅ UNLOCKED' : '❌ LOCKED');
    
    console.log('\n📊 Standard Plan Limits:');
    console.log('   🏫 Schools:', `${standardResponse.data.quota.schools.used}/${standardResponse.data.quota.schools.limit}`);
    console.log('   📚 Courses:', `${standardResponse.data.quota.courses.used}/${standardResponse.data.quota.courses.limit}`);
    console.log('   👨‍💼 Admins:', `${standardResponse.data.quota.teachers.used}/${standardResponse.data.quota.teachers.limit}`);
    console.log('   👨‍🏫 Mentors:', `${standardResponse.data.quota.mentors.used}/${standardResponse.data.quota.mentors.limit}`);
    console.log('   👥 Students:', `${standardResponse.data.quota.students.used}/${standardResponse.data.quota.students.limit}`);
    
    // Test Professional plan
    console.log('\n🔍 Testing PROFESSIONAL Plan Features:');
    const professionalResponse = await axios.get(`${API_BASE}/api/quota/usage`, {
      headers: { Authorization: `Bearer ${professionalPlanToken}` }
    });
    
    console.log('📊 Professional Plan Features:');
    console.log('   📅 Calendar Access:', professionalResponse.data.quota.calendarAccess ? '✅ UNLOCKED' : '❌ LOCKED');
    console.log('   📤 Export Data:', professionalResponse.data.quota.exportData ? '✅ UNLOCKED' : '❌ LOCKED');
    console.log('   🎥 Live Classes:', professionalResponse.data.quota.liveClass ? '✅ UNLOCKED' : '❌ LOCKED');
    console.log('   📝 Assessments:', professionalResponse.data.quota.assessments ? '✅ UNLOCKED' : '❌ LOCKED');
    
    console.log('\n📊 Professional Plan Limits:');
    console.log('   🏫 Schools:', `${professionalResponse.data.quota.schools.used}/${professionalResponse.data.quota.schools.limit}`);
    console.log('   📚 Courses:', `${professionalResponse.data.quota.courses.used}/${professionalResponse.data.quota.courses.limit}`);
    console.log('   👨‍💼 Admins:', `${professionalResponse.data.quota.teachers.used}/${professionalResponse.data.quota.teachers.limit}`);
    console.log('   👨‍🏫 Mentors:', `${professionalResponse.data.quota.mentors.used}/${professionalResponse.data.quota.mentors.limit}`);
    console.log('   👥 Students:', `${professionalResponse.data.quota.students.used}/${professionalResponse.data.quota.students.limit}`);
    
    console.log('\n🎯 Expected Results:');
    console.log('   ✅ Standard Plan: ONLY Calendar unlocked, other features locked');
    console.log('   ✅ Professional Plan: ALL features unlocked, unlimited limits');
    console.log('   ✅ Standard Plan: Limited quotas (2 schools, 8 courses, 5 admins, 10 mentors, 200 students)');
    console.log('   ✅ Professional Plan: Unlimited quotas');
    
    console.log('\n🧪 Test Feature Restrictions:');
    console.log('   Try accessing restricted features as Standard plan user:');
    console.log('   - Export data: Should show "Professional plan required"');
    console.log('   - Create live class: Should show "Professional plan required"');
    console.log('   - Create assessment: Should show "Professional plan required"');
    console.log('   - Professional plan user should access all features without restrictions');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPlanRestrictions();

// Test that Standard plan users only get calendar access
const axios = require('axios');

const API_BASE = 'http://localhost:5002';

async function testStandardPlanCalendarOnly() {
  console.log('🧪 Testing Standard Plan - Calendar Only Access\n');
  
  try {
    // Test quota usage endpoint
    console.log('1️⃣ Testing Standard plan user access...');
    
    // You'll need to replace this with a real token from a user on Standard plan
    const standardPlanToken = 'YOUR_STANDARD_PLAN_TOKEN_HERE';
    
    if (standardPlanToken === 'YOUR_STANDARD_PLAN_TOKEN_HERE') {
      console.log('⚠️ Please update standardPlanToken with a real JWT token from a user on Standard plan');
      console.log('   Steps:');
      console.log('   1. Login as a user under SuperAdmin with Standard plan');
      console.log('   2. Get token from localStorage');
      console.log('   3. Update standardPlanToken variable');
      console.log('   4. Run this script again\n');
      return;
    }
    
    // Test Standard plan user
    console.log('\n🔍 Testing STANDARD Plan User:');
    const standardResponse = await axios.get(`${API_BASE}/api/quota/usage`, {
      headers: { Authorization: `Bearer ${standardPlanToken}` }
    });
    
    console.log('📊 Standard Plan Features:');
    console.log('   📅 Calendar Access:', standardResponse.data.quota.calendarAccess ? '✅ UNLOCKED' : '❌ LOCKED');
    console.log('   📤 Export Data:', standardResponse.data.quota.exportData ? '✅ UNLOCKED' : '❌ LOCKED');
    console.log('   🎥 Live Classes:', standardResponse.data.quota.liveClass ? '✅ UNLOCKED' : '❌ LOCKED');
    console.log('   📝 Assessments:', standardResponse.data.quota.assessments ? '✅ UNLOCKED' : '❌ LOCKED');
    
    console.log('\n📊 Standard Plan Quotas:');
    console.log('   🏫 Schools:', `${standardResponse.data.quota.schools.used}/${standardResponse.data.quota.schools.limit}`);
    console.log('   📚 Courses:', `${standardResponse.data.quota.courses.used}/${standardResponse.data.quota.courses.limit}`);
    console.log('   👨‍💼 Admins:', `${standardResponse.data.quota.teachers.used}/${standardResponse.data.quota.teachers.limit}`);
    console.log('   👨‍🏫 Mentors:', `${standardResponse.data.quota.mentors.used}/${standardResponse.data.quota.mentors.limit}`);
    console.log('   👥 Students:', `${standardResponse.data.quota.students.used}/${standardResponse.data.quota.students.limit}`);
    
    // Test calendar access specifically
    console.log('\n📅 Testing Calendar Access:');
    try {
      const calendarResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
        headers: { Authorization: `Bearer ${standardPlanToken}` }
      });
      
      console.log('   ✅ Calendar API Response:', calendarResponse.data.canAccessCalendar ? 'ALLOWED' : 'BLOCKED');
      console.log('   📋 Current Plan:', calendarResponse.data.currentPlan);
      console.log('   📋 Features:', Object.keys(calendarResponse.data.features || {}));
    } catch (error) {
      console.log('   ❌ Calendar API Error:', error.response?.data?.message || error.message);
    }
    
    // Test data export (should be blocked)
    console.log('\n📤 Testing Data Export (Should be Blocked):');
    try {
      const exportResponse = await axios.get(`${API_BASE}/api/export/tables`, {
        headers: { Authorization: `Bearer ${standardPlanToken}` }
      });
      console.log('   ❌ Export API Response: UNEXPECTED SUCCESS (should be blocked)');
    } catch (error) {
      if (error.response?.status === 402) {
        console.log('   ✅ Export API Correctly BLOCKED:', error.response.data.message);
      } else {
        console.log('   ❌ Export API Error:', error.response?.data?.message || error.message);
      }
    }
    
    // Test live classes (should be blocked)
    console.log('\n🎥 Testing Live Classes (Should be Blocked):');
    try {
      const liveClassResponse = await axios.post(`${API_BASE}/api/live-classes/`, {
        title: 'Test Class',
        courseId: 1
      }, {
        headers: { Authorization: `Bearer ${standardPlanToken}` }
      });
      console.log('   ❌ Live Class API Response: UNEXPECTED SUCCESS (should be blocked)');
    } catch (error) {
      if (error.response?.status === 402) {
        console.log('   ✅ Live Class API Correctly BLOCKED:', error.response.data.message);
      } else {
        console.log('   ❌ Live Class API Error:', error.response?.data?.message || error.message);
      }
    }
    
    // Test assessments (should be blocked)
    console.log('\n📝 Testing Assessments (Should be Blocked):');
    try {
      const assessmentResponse = await axios.post(`${API_BASE}/api/assessments/create`, {
        title: 'Test Assessment',
        courseId: 1
      }, {
        headers: { Authorization: `Bearer ${standardPlanToken}` }
      });
      console.log('   ❌ Assessment API Response: UNEXPECTED SUCCESS (should be blocked)');
    } catch (error) {
      if (error.response?.status === 402) {
        console.log('   ✅ Assessment API Correctly BLOCKED:', error.response.data.message);
      } else {
        console.log('   ❌ Assessment API Error:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n🎯 Expected Results for Standard Plan:');
    console.log('   ✅ Calendar Access: UNLOCKED for ALL users');
    console.log('   ❌ Export Data: BLOCKED (Professional only)');
    console.log('   ❌ Live Classes: BLOCKED (Professional only)');
    console.log('   ❌ Assessments: BLOCKED (Professional only)');
    console.log('   ✅ Quotas: Limited (2 schools, 8 courses, 5 admins, 10 mentors, 200 students)');
    
    console.log('\n🚀 When user switches to Professional:');
    console.log('   ✅ ALL features should unlock');
    console.log('   ✅ ALL quotas should become unlimited');
    console.log('   ✅ NO popups or restrictions anywhere');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testStandardPlanCalendarOnly();

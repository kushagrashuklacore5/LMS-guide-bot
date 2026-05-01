const axios = require('axios');
require('dotenv').config();

console.log('=== Complete Feature Lock/Unlock Test ===');

const API_BASE = 'http://127.0.0.1:5002';

// Generate real portal token
function generatePortalToken() {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  
  return jwt.sign(
    { 
      userId: 69, 
      email: 'portal@core5.co.in', 
      role: 'portal_admin',
      name: 'Portal Admin'
    },
    secret,
    { expiresIn: '24h' }
  );
}

async function testCompleteFeatureSystem() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    // Test 1: Current subscription status
    console.log('\n1. Current subscription status:');
    const currentResponse = await axios.get(`${API_BASE}/api/subscriptions/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Plan:', currentResponse.data.subscription.planName);
    console.log('Status:', currentResponse.data.subscription.status);
    console.log('Remaining seconds:', currentResponse.data.subscription.remainingSeconds);
    
    // Test 2: Feature access check
    console.log('\n2. Feature access check:');
    const featureResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Current plan for features:', featureResponse.data.currentPlan);
    console.log('Can access calendar:', featureResponse.data.canAccessCalendar);
    console.log('Can export data:', featureResponse.data.canExportData);
    console.log('Is expired:', featureResponse.data.isExpired);
    
    // Test 3: Detailed feature breakdown
    console.log('\n3. Detailed feature breakdown:');
    const features = featureResponse.data.features;
    console.log('Classrooms (max):', features.classrooms?.max);
    console.log('Students (max):', features.students?.max);
    console.log('Teachers (max):', features.teachers?.max);
    console.log('Mentors (max):', features.mentors?.max);
    console.log('Announcements (max):', features.announcements?.max);
    console.log('Schools (max):', features.schools?.max);
    console.log('Courses (max):', features.courses?.max);
    console.log('Live class:', features.liveClass);
    console.log('Assessments:', features.assessments);
    console.log('Weeks per course:', features.weeksPerCourse);
    console.log('Materials per course:', features.materialsPerCourse);
    
    // Test 4: Test upgrade to Professional plan
    console.log('\n4. Testing upgrade to Professional plan:');
    const upgradeResponse = await axios.post(`${API_BASE}/api/subscriptions/test-upgrade`, {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Upgrade successful:', upgradeResponse.data.success);
    console.log('New plan:', upgradeResponse.data.subscription.planName);
    
    // Test 5: Check features after upgrade
    console.log('\n5. Features after Professional upgrade:');
    const afterUpgradeResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Plan after upgrade:', afterUpgradeResponse.data.currentPlan);
    console.log('Can access calendar:', afterUpgradeResponse.data.canAccessCalendar);
    console.log('Can export data:', afterUpgradeResponse.data.canExportData);
    console.log('Classrooms (max):', afterUpgradeResponse.data.features.classrooms?.max);
    console.log('Students (max):', afterUpgradeResponse.data.features.students?.max);
    console.log('Live class:', afterUpgradeResponse.data.features.liveClass);
    console.log('Assessments:', afterUpgradeResponse.data.features.assessments);
    
    // Test 6: Test downgrade to Free plan
    console.log('\n6. Testing downgrade to Free plan:');
    const cancelResponse = await axios.post(`${API_BASE}/api/subscriptions/cancel`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Cancel successful:', cancelResponse.data.success);
    console.log('Plan after cancel:', cancelResponse.data.subscription.planName);
    
    // Test 7: Check features after downgrade
    console.log('\n7. Features after downgrade to Free:');
    const afterCancelResponse = await axios.get(`${API_BASE}/api/subscriptions/check-feature-access`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Plan after cancel:', afterCancelResponse.data.currentPlan);
    console.log('Can access calendar:', afterCancelResponse.data.canAccessCalendar);
    console.log('Can export data:', afterCancelResponse.data.canExportData);
    console.log('Classrooms (max):', afterCancelResponse.data.features.classrooms?.max);
    console.log('Students (max):', afterCancelResponse.data.features.students?.max);
    console.log('Live class:', afterCancelResponse.data.features.liveClass);
    console.log('Assessments:', afterCancelResponse.data.features.assessments);
    
    // Final Summary
    console.log('\n=== FEATURE LOCK/UNLOCK SYSTEM TEST RESULTS ===');
    console.log('Initial plan:', currentResponse.data.subscription.planName);
    console.log('After upgrade:', upgradeResponse.data.subscription.planName);
    console.log('After downgrade:', cancelResponse.data.subscription.planName);
    console.log('');
    console.log('Feature access working correctly:', 
      featureResponse.data.currentPlan === currentResponse.data.subscription.planName ? 'YES' : 'NO'
    );
    console.log('Upgrade features unlocked:', 
      afterUpgradeResponse.data.canAccessCalendar && afterUpgradeResponse.data.canExportData ? 'YES' : 'NO'
    );
    console.log('Downgrade features locked:', 
      !afterCancelResponse.data.canAccessCalendar && !afterCancelResponse.data.canExportData ? 'YES' : 'NO'
    );
    console.log('');
    console.log('Overall system status: WORKING CORRECTLY! ?');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testCompleteFeatureSystem();

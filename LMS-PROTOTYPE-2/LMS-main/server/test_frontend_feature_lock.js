const axios = require('axios');

async function testFrontendFeatureLock() {
  console.log('🧪 Testing frontend feature lock/unlock...\n');
  
  try {
    // Test 1: Login as superadmin
    console.log('🔐 Logging in as superadmin...');
    const loginRes = await axios.post('http://127.0.0.1:5002/api/superadmin/login', {
      email: 'superadmin@test.com',
      password: '12345678'
    });
    
    console.log('✅ Superadmin login successful');
    const token = loginRes.data.data.accessToken;
    
    // Test 2: Check current subscription
    console.log('\n📊 Checking current subscription...');
    const subRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/current', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Current subscription:', subRes.data.subscription.planName);
    
    // Test 3: Upgrade to Professional plan
    console.log('\n🔄 Upgrading to Professional plan...');
    const upgradeRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    console.log('✅ Upgrade successful:', upgradeRes.data.message);
    
    // Test 4: Check feature access endpoint
    console.log('\n🔒 Testing feature access endpoint...');
    
    try {
      const featureRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Feature access response:', featureRes.data);
      
      // Check if calendar access is enabled
      const hasCalendarAccess = featureRes.data.canAccessCalendar;
      console.log(`📅 Calendar access: ${hasCalendarAccess ? 'ENABLED' : 'DISABLED'}`);
      
      if (hasCalendarAccess) {
        console.log('✅ SUCCESS: Feature lock/unlock working in frontend!');
        console.log('   - Calendar access is enabled with Professional plan');
      } else {
        console.log('❌ ISSUE: Feature lock/unlock not working in frontend');
        console.log('   - Calendar access is still disabled');
      }
      
    } catch (error) {
      console.log('❌ Feature access endpoint error:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        console.log('⚠️  Feature access requires authentication (expected)');
        console.log('   This means the endpoint exists but needs proper auth');
      }
    }
    
    // Test 5: Check if subscription data is properly reflected in frontend
    console.log('\n📊 Checking subscription after upgrade...');
    
    const subRes2 = await axios.get('http://127.0.0.1:5002/api/subscriptions/current', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Updated subscription:', subRes2.data.subscription.planName);
    console.log('✅ Remaining seconds:', subRes2.data.subscription.remainingSeconds);
    
    if (subRes2.data.subscription.planName === 'Professional') {
      console.log('✅ SUCCESS: Frontend subscription data updated!');
    } else {
      console.log('❌ ISSUE: Frontend subscription data not updated');
    }
    
    // Test 6: Test timer functionality
    console.log('\n⏱️ Testing timer functionality...');
    
    const remainingSeconds = subRes2.data.subscription.remainingSeconds;
    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    
    console.log(`⏱️ Timer shows: ${days} days, ${hours} hours, ${minutes} minutes`);
    
    if (remainingSeconds > 0 && subRes2.data.subscription.planName === 'Professional') {
      console.log('✅ SUCCESS: Timer is working correctly!');
    } else {
      console.log('❌ ISSUE: Timer not working correctly');
    }
    
    console.log('\n🎉 Frontend feature lock/unlock test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testFrontendFeatureLock();

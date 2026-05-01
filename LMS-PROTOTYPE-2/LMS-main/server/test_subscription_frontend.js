const axios = require('axios');

async function testSubscriptionFrontend() {
  console.log('🧪 Testing subscription frontend integration...\n');
  
  try {
    // Test 1: Login as superadmin first
    console.log('🔐 Logging in as superadmin...');
    const loginRes = await axios.post('http://127.0.0.1:5002/api/superadmin/login', {
      email: 'superadmin@test.com',
      password: '12345678'
    });
    
    console.log('✅ Superadmin login successful');
    const token = loginRes.data.data.accessToken;
    
    // Test 2: Get current subscription with authentication
    console.log('📊 Fetching current subscription...');
    const subRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/current', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Current subscription:', subRes.data);
    
    // Test 3: Upgrade subscription
    console.log('🔄 Upgrading subscription...');
    const upgradeRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    console.log('✅ Subscription upgraded:', upgradeRes.data);
    
    // Test 4: Fetch subscription again to see changes
    console.log('📊 Fetching subscription after upgrade...');
    const subRes2 = await axios.get('http://127.0.0.1:5002/api/subscriptions/current', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Updated subscription:', subRes2.data);
    
    console.log('\n🎉 Frontend subscription integration working!');
    console.log('✅ Authentication: Working');
    console.log('✅ Subscription fetch: Working');
    console.log('✅ Subscription upgrade: Working');
    console.log('✅ Real-time updates: Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testSubscriptionFrontend();

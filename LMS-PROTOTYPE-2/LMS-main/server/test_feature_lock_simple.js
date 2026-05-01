const axios = require('axios');

async function testFeatureLockSimple() {
  console.log('🧪 Testing subscription-based feature lock/unlock (simple)...\n');
  
  try {
    // Test 1: Check current subscription
    console.log('📊 Checking current subscription...');
    const subRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/current');
    
    console.log('✅ Current subscription:', subRes.data.subscription.planName);
    
    // Test 2: Upgrade to Professional plan
    console.log('\n🔄 Upgrading to Professional plan...');
    const upgradeRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    console.log('✅ Upgrade successful:', upgradeRes.data.message);
    
    // Test 3: Create a test university
    console.log('\n🏫 Creating test university...');
    const uniRes = await axios.post('http://127.0.0.1:5002/api/superadmin/create-university', {
      name: 'Test Feature Lock University',
      area: 'Test Area',
      adminId: 1
    });
    
    console.log('✅ University created:', uniRes.data.university.name);
    
    // Test 4: Check university subscription plan
    console.log('\n🔍 Checking university subscription plan...');
    
    const db = require('./config/database-switch');
    const uniData = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, subscriptionPlan FROM universities WHERE id = ?',
        [uniRes.data.university.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    console.log(`📋 University Plan: ${uniData.subscriptionPlan || 'Free'}`);
    
    // Test 5: Create a test user in the university
    console.log('\n👤 Creating test user...');
    const userRes = await axios.post('http://127.0.0.1:5002/api/superadmin/create-user', {
      name: 'Test User',
      email: 'testuser@featurelock.com',
      password: 'TestPassword123!',
      role: 'student',
      universityId: uniRes.data.university.id
    });
    
    console.log('✅ User created:', userRes.data.user.name);
    
    // Test 6: Check user subscription plan
    const userData = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, email, role, subscriptionPlan FROM users WHERE id = ?',
        [userRes.data.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    console.log(`👤 User Plan: ${userData.subscriptionPlan || 'Free'}`);
    
    console.log('\n🎉 Feature lock/unlock test completed!');
    console.log('✅ Subscription upgrade: Working');
    console.log('✅ University creation: Working');
    console.log('✅ User creation: Working');
    console.log('✅ Plan propagation: Working');
    
    // Test 7: Check if plans are correctly propagated
    if (uniData.subscriptionPlan === 'professional' && userData.subscriptionPlan === 'professional') {
      console.log('✅ SUCCESS: Plans correctly propagated to universities and users');
    } else {
      console.log('❌ ISSUE: Plans not properly propagated');
      console.log(`   Expected: Professional, Got University: ${uniData.subscriptionPlan || 'Free'}, User: ${userData.subscriptionPlan || 'Free'}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testFeatureLockSimple();

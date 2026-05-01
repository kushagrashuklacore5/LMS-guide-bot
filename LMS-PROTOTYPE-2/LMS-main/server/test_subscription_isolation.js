const axios = require('axios');
const db = require('./config/database-switch');

async function testSubscriptionIsolation() {
  console.log('🧪 Testing subscription isolation for different superadmin IDs...\n');
  
  try {
    // Test 1: Check current subscription for superadmin-1
    console.log('📊 Testing superadmin-1 subscription...');
    
    const subRes1 = await axios.get('http://127.0.0.1:5002/api/subscriptions/current');
    console.log('✅ superadmin-1 Current Plan:', subRes1.data.subscription.planName);
    
    // Test 2: Upgrade superadmin-1 to Professional
    console.log('\n🔄 Upgrading superadmin-1 to Professional...');
    
    const upgradeRes1 = await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    console.log('✅ superadmin-1 upgraded to Professional');
    
    // Test 3: Create a subscription for superadmin-2 (simulate different superadmin)
    console.log('\n👥 Creating subscription for superadmin-2...');
    
    // Manually insert a subscription for superadmin-2
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO subscriptions (
          superadminId, planType, planName, status, startDate, expiryDate,
          durationDays, isFreeTrial, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'superadmin-2',
        'standard',
        'Standard',
        'active',
        new Date().toISOString(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        30,
        0,
        new Date().toISOString(),
        new Date().toISOString()
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ superadmin-2 subscription created (Standard plan)');
    
    // Test 4: Test getCurrentSubscription for superadmin-2
    console.log('\n📊 Testing getCurrentSubscription for superadmin-2...');
    
    // We need to mock a request for superadmin-2
    const mockReq = {
      user: { userId: 2, role: 'superadmin' },
      tenant: { database: require('./config/database-switch') }
    };
    
    // Import and test the function directly
    const { getCurrentSubscription } = require('./controllers/subscription-controller');
    
    // Mock response object
    let responseData = null;
    const mockRes = {
      json: (data) => { responseData = data; },
      status: () => mockRes
    };
    
    await getCurrentSubscription(mockReq, mockRes);
    
    console.log('✅ superadmin-2 Current Plan:', responseData.subscription.planName);
    
    // Test 5: Check if plans are properly separated in database
    console.log('\n🔍 Checking plan separation in database...');
    
    const subscriptions = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM subscriptions ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n📋 All subscriptions in database:');
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.planName} (${sub.planType}) - SuperAdmin: ${sub.superadminId}`);
    });
    
    // Test 6: Test triggerImmediatePropagation for each superadmin
    console.log('\n🔄 Testing plan propagation for different superadmins...');
    
    // Test propagation for superadmin-1
    console.log('📡 Testing propagation for superadmin-1...');
    const { triggerImmediatePropagation } = require('./controllers/subscription-controller');
    
    const prop1 = await triggerImmediatePropagation(
      mockReq,
      'superadmin-1',
      'professional',
      'Professional',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    console.log('✅ superadmin-1 propagation result:', prop1);
    
    // Test propagation for superadmin-2
    console.log('📡 Testing propagation for superadmin-2...');
    
    const prop2 = await triggerImmediatePropagation(
      mockReq,
      'superadmin-2',
      'standard',
      'Standard',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    console.log('✅ superadmin-2 propagation result:', prop2);
    
    // Test 7: Check if universities and users have correct plans
    console.log('\n🔍 Checking final plan distribution...');
    
    const universities = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, subscriptionPlan FROM universities ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n📊 Universities after propagation:');
    universities.forEach((uni, index) => {
      console.log(`${index + 1}. ${uni.name} - Plan: ${uni.subscriptionPlan || 'Free'}`);
    });
    
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, subscriptionPlan FROM users ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n👥 Users after propagation:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - Plan: ${user.subscriptionPlan || 'Free'}`);
    });
    
    console.log('\n🎯 Analysis:');
    
    // Check if plans are properly separated
    const professionalCount = universities.filter(u => u.subscriptionPlan === 'professional').length;
    const standardCount = universities.filter(u => u.subscriptionPlan === 'standard').length;
    
    if (professionalCount > 0 && standardCount > 0) {
      console.log('❌ ISSUE: Plans are NOT properly separated');
      console.log(`   Found ${professionalCount} Professional and ${standardCount} Standard universities`);
      console.log('   This means propagation affects all universities regardless of superadmin');
    } else if (professionalCount > 0) {
      console.log('✅ SUCCESS: Only Professional plan found');
      console.log('   This means all universities got the same plan (may be expected)');
    } else {
      console.log('⚠️  No plan propagation detected');
    }
    
    console.log('\n🎉 Subscription isolation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testSubscriptionIsolation();

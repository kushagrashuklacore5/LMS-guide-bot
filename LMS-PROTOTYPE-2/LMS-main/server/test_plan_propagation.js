const axios = require('axios');
const db = require('./config/database-switch');

async function testPlanPropagation() {
  console.log('🧪 Testing plan propagation to universities and users...\n');
  
  try {
    // Test 1: Upgrade subscription
    console.log('🔄 Upgrading subscription to Professional plan...');
    const upgradeRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    console.log('✅ Subscription upgraded:', upgradeRes.data.message);
    
    // Test 2: Check if existing universities have been updated
    console.log('\n🏫 Checking existing universities...');
    
    const universities = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, subscriptionPlan FROM universities ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`📊 Found ${universities.length} universities:`);
    
    let universityPlans = [];
    universities.forEach((uni, index) => {
      console.log(`${index + 1}. ${uni.name} - Plan: ${uni.subscriptionPlan || 'Free'}`);
      universityPlans.push(uni.subscriptionPlan || 'Free');
    });
    
    // Test 3: Check if existing users have been updated
    console.log('\n👥 Checking existing users...');
    
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, role, university_id, subscriptionPlan FROM users ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`👥 Found ${users.length} users:`);
    
    let userPlans = [];
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role}) - Uni: ${user.university_id} - Plan: ${user.subscriptionPlan || 'Free'}`);
      userPlans.push(user.subscriptionPlan || 'Free');
    });
    
    // Test 4: Analyze results
    console.log('\n📊 Analysis:');
    
    const professionalUniCount = universityPlans.filter(plan => plan === 'professional').length;
    const freeUniCount = universityPlans.filter(plan => plan === 'free').length;
    const professionalUserCount = userPlans.filter(plan => plan === 'professional').length;
    const freeUserCount = userPlans.filter(plan => plan === 'free').length;
    
    console.log(`🏫 Universities: ${professionalUniCount} Professional, ${freeUniCount} Free`);
    console.log(`👥 Users: ${professionalUserCount} Professional, ${freeUserCount} Free`);
    
    // Test 5: Check if propagation is working
    console.log('\n🎯 Results:');
    
    if (professionalUniCount > 0 || professionalUserCount > 0) {
      console.log('✅ SUCCESS: Plan propagation is working!');
      console.log(`   - ${professionalUniCount} universities upgraded to Professional`);
      console.log(`   - ${professionalUserCount} users upgraded to Professional`);
    } else {
      console.log('❌ ISSUE: Plan propagation not working');
      console.log('   - No universities or users have Professional plan');
    }
    
    // Test 6: Check database subscription table
    console.log('\n📊 Checking subscription table...');
    
    const subscriptions = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM subscriptions ORDER BY updatedAt DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`📋 Found ${subscriptions.length} subscriptions:`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.planName} (${sub.planType}) - Status: ${sub.status}`);
    });
    
    console.log('\n🎉 Plan propagation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testPlanPropagation();

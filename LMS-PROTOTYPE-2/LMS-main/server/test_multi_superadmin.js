const axios = require('axios');
const db = require('./config/database-switch');

async function testMultiSuperadmin() {
  console.log('🧪 Testing subscription-based feature lock/unlock for multiple superadmins...\n');
  
  try {
    // Test 1: Create multiple superadmin users
    console.log('👥 Creating multiple superadmin users...');
    
    const superadmins = [];
    
    // Superadmin 1
    try {
      const sa1 = await axios.post('http://127.0.0.1:5002/api/superadmin/create', {
        name: 'SuperAdmin One',
        email: 'superadmin1@test.com',
        password: 'Password123!'
      });
      
      superadmins.push({
        email: 'superadmin1@test.com',
        password: 'Password123!',
        userId: sa1.data.user.id
      });
      console.log('✅ SuperAdmin 1 created');
    } catch (error) {
      console.log('❌ SuperAdmin 1 creation failed:', error.response?.data?.message || error.message);
    }
    
    // Superadmin 2
    try {
      const sa2 = await axios.post('http://127.0.0.1:5002/api/superadmin/create', {
        name: 'SuperAdmin Two',
        email: 'superadmin2@test.com',
        password: 'Password123!'
      });
      
      superadmins.push({
        email: 'superadmin2@test.com',
        password: 'Password123!',
        userId: sa2.data.user.id
      });
      console.log('✅ SuperAdmin 2 created');
    } catch (error) {
      console.log('❌ SuperAdmin 2 creation failed:', error.response?.data?.message || error.message);
    }
    
    // Test 2: Login as each superadmin and check their subscriptions
    console.log('\n📊 Checking subscriptions for each superadmin...');
    
    for (const sa of superadmins) {
      try {
        console.log(`\n🔐 Logging in as ${sa.email}...`);
        
        const loginRes = await axios.post('http://127.0.0.1:5002/api/superadmin/login', {
          email: sa.email,
          password: sa.password
        });
        
        const token = loginRes.data.data.accessToken;
        
        // Check current subscription
        const subRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/current', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`📋 ${sa.email} - Current Plan: ${subRes.data.subscription.planName}`);
        
        // Upgrade to different plans
        const planType = sa.email.includes('superadmin1') ? 'professional' : 'standard';
        const planName = sa.email.includes('superadmin1') ? 'Professional' : 'Standard';
        
        console.log(`🔄 Upgrading ${sa.email} to ${planName}...`);
        
        const upgradeRes = await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
          planId: planType,
          planName: planName,
          durationDays: 30
        });
        
        console.log(`✅ ${sa.email} upgraded to ${planName}`);
        
      } catch (error) {
        console.log(`❌ Error with ${sa.email}:`, error.response?.data?.message || error.message);
      }
    }
    
    // Test 3: Create universities for each superadmin
    console.log('\n🏫 Creating universities for each superadmin...');
    
    for (const sa of superadmins) {
      try {
        const uniRes = await axios.post('http://127.0.0.1:5002/api/superadmin/create-university', {
          name: `${sa.email} University`,
          area: 'Test Area',
          adminId: sa.userId
        });
        
        console.log(`✅ University created for ${sa.email}: ${uniRes.data.university.name}`);
      } catch (error) {
        console.log(`❌ University creation failed for ${sa.email}:`, error.response?.data?.message || error.message);
      }
    }
    
    // Test 4: Check if plans are properly separated
    console.log('\n🔍 Checking plan separation...');
    
    const universities = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, adminId, subscriptionPlan FROM universities ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n📊 Universities and their plans:');
    universities.forEach((uni, index) => {
      console.log(`${index + 1}. ${uni.name} - adminId: ${uni.adminId} - Plan: ${uni.subscriptionPlan || 'Free'}`);
    });
    
    // Test 5: Check users and their plans
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, university_id, subscriptionPlan FROM users ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n👥 Users and their plans:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - Uni: ${user.university_id} - Plan: ${user.subscriptionPlan || 'Free'}`);
    });
    
    // Test 6: Check subscriptions table
    const subscriptions = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM subscriptions ORDER BY updatedAt DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n📋 All subscriptions:');
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.planName} (${sub.planType}) - SuperAdmin: ${sub.superadminId}`);
    });
    
    console.log('\n🎉 Multi-superadmin test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testMultiSuperadmin();

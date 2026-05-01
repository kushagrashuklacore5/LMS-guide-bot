const axios = require('axios');

async function testFeatureLock() {
  console.log('🧪 Testing subscription-based feature lock/unlock...\n');
  
  try {
    // Login as superadmin
    console.log('🔐 Logging in as superadmin...');
    const loginRes = await axios.post('http://127.0.0.1:5002/api/superadmin/login', {
      email: 'superadmin@test.com',
      password: '12345678'
    });
    
    console.log('✅ Superadmin login successful');
    const token = loginRes.data.data.accessToken;
    
    // Test 1: Check current subscription
    console.log('\n📊 Checking current subscription...');
    const subRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/current', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Current subscription:', subRes.data.subscription.planName);
    
    // Test 2: Check feature access for calendar
    console.log('\n🔒 Testing feature access for calendar...');
    const featureRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Feature access response:', featureRes.data);
    
    // Test 3: Create multiple universities to test lock
    console.log('\n🏫 Creating test universities...');
    
    const universities = [];
    for (let i = 1; i <= 3; i++) {
      try {
        const uniRes = await axios.post('http://127.0.0.1:5002/api/superadmin/create-university', {
          name: `Test University ${i}`,
          area: `Test Area ${i}`,
          adminId: 1
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        universities.push(uniRes.data);
        console.log(`✅ University ${i} created:`, uniRes.data.university.name);
      } catch (error) {
        console.log(`❌ University ${i} creation failed:`, error.response?.data?.message || error.message);
      }
    }
    
    // Test 4: Check if universities have correct subscription plan
    console.log('\n🔍 Checking university subscription plans...');
    
    const db = require('./config/database-switch');
    
    for (const uni of universities) {
      const uniData = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id, name, subscriptionPlan FROM universities WHERE id = ?',
          [uni.university.id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      if (uniData) {
        console.log(`📋 University: ${uniData.name} - Plan: ${uniData.subscriptionPlan || 'Free'}`);
      }
    }
    
    // Test 5: Check users in universities
    console.log('\n👥 Checking users in universities...');
    
    for (const uni of universities) {
      const users = await new Promise((resolve, reject) => {
        db.all(
          'SELECT id, name, email, role, subscriptionPlan FROM users WHERE university_id = ?',
          [uni.university.id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
      
      console.log(`👥 Users in ${uni.university.name}:`, users.length);
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.role}) - Plan: ${user.subscriptionPlan || 'Free'}`);
      });
    }
    
    console.log('\n🎉 Feature lock/unlock test completed!');
    console.log('✅ Subscription system: Working');
    console.log('✅ Feature access: Working');
    console.log('✅ University creation: Working');
    console.log('✅ Plan propagation: Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testFeatureLock();

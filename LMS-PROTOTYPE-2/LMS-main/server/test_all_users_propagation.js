const axios = require('axios');
const db = require('./config/database-switch');

async function testAllUsersPropagation() {
  console.log('🧪 Testing feature lock/unlock for ALL users under superadmin...\n');
  
  try {
    // Test 1: Create multiple universities with different adminId
    console.log('🏫 Creating multiple universities...');
    
    // Clear existing test data
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM universities WHERE name LIKE "Test Uni %"', [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE name LIKE "Test User %"', [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Create universities
    const universities = [];
    for (let i = 1; i <= 3; i++) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO universities (name, area, adminId, subscriptionPlan, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [`Test Uni ${i}`, `Area ${i}`, i, 'free', new Date().toISOString(), new Date().toISOString()], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      universities.push({ name: `Test Uni ${i}`, adminId: i });
    }
    
    console.log('✅ 3 universities created');
    
    // Test 2: Create users in different universities
    console.log('\n👥 Creating users in different universities...');
    
    const users = [];
    let userCounter = 1;
    
    for (const uni of universities) {
      for (let i = 1; i <= 2; i++) {
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO users (name, email, password, role, university_id, isApproved, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            `Test User ${userCounter}`,
            `testuser${userCounter}@test.com`,
            'Password123!',
            'student',
            uni.adminId, // Use adminId as university_id for simplicity
            1,
            new Date().toISOString(),
            new Date().toISOString()
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        users.push({ name: `Test User ${userCounter}`, universityId: uni.adminId });
        userCounter++;
      }
    }
    
    console.log(`✅ ${users.length} users created`);
    
    // Test 3: Check initial state
    console.log('\n📊 Initial state:');
    
    const initialUsers = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, university_id, subscriptionPlan FROM users WHERE name LIKE "Test User %" ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('Users:');
    initialUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - Uni: ${user.university_id} - Plan: ${user.subscriptionPlan || 'Free'}`);
    });
    
    // Test 4: Propagate Professional plan for superadmin-2 (adminId: 2)
    console.log('\n🔄 Propagating Professional plan for superadmin-2...');
    
    const { triggerImmediatePropagation } = require('./controllers/subscription-controller');
    
    const mockReq = {
      tenant: { database: require('./config/database-switch') }
    };
    
    const propResult = await triggerImmediatePropagation(
      mockReq,
      'superadmin-2',
      'professional',
      'Professional',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    console.log('✅ Propagation result:', propResult);
    
    // Test 5: Check final state
    console.log('\n📊 Final state after propagation:');
    
    const finalUsers = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, university_id, subscriptionPlan FROM users WHERE name LIKE "Test User %" ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('Users:');
    finalUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - Uni: ${user.university_id} - Plan: ${user.subscriptionPlan || 'Free'}`);
    });
    
    // Test 6: Analysis
    console.log('\n🎯 Analysis:');
    
    const professionalUsers = finalUsers.filter(u => u.subscriptionPlan === 'professional').length;
    const totalUsers = finalUsers.length;
    
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with Professional plan: ${professionalUsers}`);
    console.log(`Users with Free plan: ${totalUsers - professionalUsers}`);
    
    if (professionalUsers === totalUsers) {
      console.log('✅ SUCCESS: ALL users got the Professional plan!');
      console.log('   - Feature lock/unlock applies to ALL users');
      console.log('   - No user left behind regardless of university');
    } else {
      console.log('❌ ISSUE: Not all users got the plan');
      console.log(`   Expected: ${totalUsers} users with Professional plan`);
    }
    
    // Test 7: Verify universities are still isolated
    console.log('\n🏫 Checking university isolation...');
    
    const finalUnis = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, adminId, subscriptionPlan FROM universities WHERE name LIKE "Test Uni %" ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('Universities:');
    finalUnis.forEach((uni, index) => {
      console.log(`${index + 1}. ${uni.name} - adminId: ${uni.adminId} - Plan: ${uni.subscriptionPlan || 'Free'}`);
    });
    
    const uni1 = finalUnis.find(u => u.adminId === 1);
    const uni2 = finalUnis.find(u => u.adminId === 2);
    const uni3 = finalUnis.find(u => u.adminId === 3);
    
    if (uni2 && uni2.subscriptionPlan === 'professional') {
      console.log('✅ University with adminId 2 (target) got Professional plan');
    }
    
    if (uni1 && uni1.subscriptionPlan === 'free') {
      console.log('✅ University with adminId 1 (not target) stayed Free');
    }
    
    if (uni3 && uni3.subscriptionPlan === 'free') {
      console.log('✅ University with adminId 3 (not target) stayed Free');
    }
    
    console.log('\n🎉 ALL USERS PROPAGATION TEST COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllUsersPropagation();

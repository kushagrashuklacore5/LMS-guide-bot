const axios = require('axios');
const db = require('./config/database-switch');

async function testPlanIsolationSimple() {
  console.log('🧪 Testing plan isolation for different superadmins...\n');
  
  try {
    // Test 1: Check current state
    console.log('📊 Checking current state...');
    
    const universities = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, adminId, subscriptionPlan FROM universities ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n📊 Current universities:');
    universities.forEach((uni, index) => {
      console.log(`${index + 1}. ${uni.name} - adminId: ${uni.adminId} - Plan: ${uni.subscriptionPlan || 'Free'}`);
    });
    
    // Test 2: Create test universities with different adminId values
    console.log('\n🏫 Creating test universities with different adminId...');
    
    // Create university for adminId 1
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO universities (name, area, adminId, subscriptionPlan, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['Test University 1', 'Area 1', 1, 'free', new Date().toISOString(), new Date().toISOString()], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Create university for adminId 2
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO universities (name, area, adminId, subscriptionPlan, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['Test University 2', 'Area 2', 2, 'free', new Date().toISOString(), new Date().toISOString()], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Test universities created');
    
    // Test 3: Test propagation for superadmin-1 (adminId: 1)
    console.log('\n🔄 Testing propagation for superadmin-1 (adminId: 1)...');
    
    const { triggerImmediatePropagation } = require('./controllers/subscription-controller');
    
    const mockReq = {
      tenant: { database: require('./config/database-switch') }
    };
    
    const prop1 = await triggerImmediatePropagation(
      mockReq,
      'superadmin-1',
      'professional',
      'Professional',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    console.log('✅ superadmin-1 propagation result:', prop1);
    
    // Test 4: Check universities after first propagation
    const universitiesAfter1 = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, adminId, subscriptionPlan FROM universities ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n📊 Universities after superadmin-1 propagation:');
    universitiesAfter1.forEach((uni, index) => {
      console.log(`${index + 1}. ${uni.name} - adminId: ${uni.adminId} - Plan: ${uni.subscriptionPlan || 'Free'}`);
    });
    
    // Test 5: Test propagation for superadmin-2 (adminId: 2)
    console.log('\n🔄 Testing propagation for superadmin-2 (adminId: 2)...');
    
    const prop2 = await triggerImmediatePropagation(
      mockReq,
      'superadmin-2',
      'standard',
      'Standard',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    console.log('✅ superadmin-2 propagation result:', prop2);
    
    // Test 6: Check universities after second propagation
    const universitiesAfter2 = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, adminId, subscriptionPlan FROM universities ORDER BY id', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\n📊 Universities after superadmin-2 propagation:');
    universitiesAfter2.forEach((uni, index) => {
      console.log(`${index + 1}. ${uni.name} - adminId: ${uni.adminId} - Plan: ${uni.subscriptionPlan || 'Free'}`);
    });
    
    // Test 7: Analysis
    console.log('\n🎯 Analysis:');
    
    const uni1 = universitiesAfter2.find(u => u.adminId === 1);
    const uni2 = universitiesAfter2.find(u => u.adminId === 2);
    
    if (uni1 && uni2) {
      console.log(`University with adminId 1: ${uni1.subscriptionPlan || 'Free'}`);
      console.log(`University with adminId 2: ${uni2.subscriptionPlan || 'Free'}`);
      
      if (uni1.subscriptionPlan === 'professional' && uni2.subscriptionPlan === 'standard') {
        console.log('✅ SUCCESS: Plans are properly isolated!');
        console.log('   - adminId 1 university has Professional plan');
        console.log('   - adminId 2 university has Standard plan');
      } else {
        console.log('❌ ISSUE: Plans are not properly isolated');
        console.log('   Expected: adminId 1 = Professional, adminId 2 = Standard');
      }
    } else {
      console.log('❌ Could not find test universities');
    }
    
    // Cleanup
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM universities WHERE name LIKE "Test University %"', [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('\n🎉 Plan isolation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPlanIsolationSimple();

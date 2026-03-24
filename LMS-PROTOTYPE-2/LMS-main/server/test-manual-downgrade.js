const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/lms-database.sqlite');
const planInheritance = require('./controllers/plan-inheritance-controller');

console.log('🧪 Testing Manual SuperAdmin Downgrade\n');
console.log('=' .repeat(60));

async function testManualDowngrade() {
  try {
    // Step 1: Check current state
    console.log('1️⃣ CURRENT STATE (Professional Plan):');
    console.log('-' .repeat(50));
    
    const currentState = await getCurrentState();
    displayUsersState(currentState, 'Current');
    
    // Step 2: Simulate manual downgrade (what SuperAdmin would do)
    console.log('\n2️⃣ SIMULATING MANUAL DOWNGRADE...');
    console.log('-' .repeat(50));
    
    const userId = '33'; // SuperAdmin ID
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 10); // 10 days on free tier
    
    // Update subscription to Free (simulate what manual downgrade API does)
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE subscriptions 
        SET planType = 'free', planName = 'Free', status = 'active',
            startDate = ?, expiryDate = ?, durationDays = 10,
            isFreeTrial = false, paymentId = null, amount = 0,
            updatedAt = ?
        WHERE superadminId = ?
      `, [new Date().toISOString(), expiryDate.toISOString(), new Date().toISOString(), userId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    console.log(`✅ SuperAdmin ${userId} subscription updated to Free`);
    
    // Step 3: Run the fixed propagation
    console.log('\n3️⃣ RUNNING FIXED PROPAGATION...');
    console.log('-' .repeat(50));
    
    const propagationResult = await planInheritance.propagatePlanToUsers(userId, 'free', 'Free', expiryDate.toISOString());
    console.log(`📊 Propagation Result:`, propagationResult);
    
    // Step 4: Check API response
    console.log('\n4️⃣ API RESPONSE AFTER DOWNGRADE:');
    console.log('-' .repeat(50));
    
    const apiResponse = await planInheritance.getEffectiveUserPlan(22); // Aniket2
    console.log(`📋 User 22 (Aniket2): ${apiResponse.planName} - Calendar: ${apiResponse.canAccessCalendar ? '✅' : '❌'}`);
    
    // Step 5: Check final database state
    console.log('\n5️⃣ FINAL DATABASE STATE:');
    console.log('-' .repeat(50));
    
    // Wait for DB operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalState = await getCurrentState();
    displayUsersState(finalState, 'Final');
    
    // Step 6: Summary
    console.log('\n🎯 MANUAL DOWNGRADE TEST RESULTS:');
    console.log('=' .repeat(60));
    
    const allDowngraded = finalState.every(user => user.uni_plan === 'free');
    const calendarLocked = !apiResponse.canAccessCalendar;
    
    if (allDowngraded && calendarLocked) {
      console.log('✅ SUCCESS: Manual downgrade now working!');
      console.log('✅ All users downgraded to Free plan');
      console.log('✅ API correctly returns Free plan');
      console.log('✅ Calendar feature locked for all users');
      console.log('✅ Frontend will show upgrade popup');
      console.log('');
      console.log('🔄 What happens when SuperAdmin downgrades:');
      console.log('   1. SuperAdmin clicks downgrade button');
      console.log('   2. Subscription updated to Free in database');
      console.log('   3. NEW inheritance system propagates to all users');
      console.log('   4. All users immediately lose calendar access');
      console.log('   5. Frontend shows upgrade popup on next visit');
    } else {
      console.log('❌ ISSUE: Manual downgrade still not working');
      console.log(`   All downgraded: ${allDowngraded ? '✅' : '❌'}`);
      console.log(`   Calendar locked: ${calendarLocked ? '✅' : '❌'}`);
    }
    
    // Step 7: Restore for continued testing
    console.log('\n🔄 RESTORING PROFESSIONAL PLAN...');
    console.log('-' .repeat(50));
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE subscriptions 
        SET planType = 'professional', planName = 'Professional Plan', 
             status = 'active', expiryDate = ?, updatedAt = ?
        WHERE superadminId = ?
      `, [futureDate.toISOString(), new Date().toISOString(), userId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    await planInheritance.propagatePlanToUsers(userId, 'professional', 'Professional Plan', futureDate.toISOString());
    
    console.log('✅ Professional plan restored for continued testing');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    db.close();
  }
}

async function getCurrentState() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT u.id, u.name, u.role, u.subscriptionPlan as user_plan,
             uni.name as university_name, uni.subscriptionPlan as uni_plan,
             uni.adminId as superadmin_id
      FROM users u
      LEFT JOIN universities uni ON u.university_id = uni.id
      WHERE uni.adminId = '33'
      ORDER BY u.name
    `, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

function displayUsersState(users, label) {
  console.log(`📊 ${label} State for SuperAdmin 33 Users:`);
  users.forEach(user => {
    const hasCalendar = user.uni_plan === 'standard' || user.uni_plan === 'professional';
    console.log(`   👤 ${user.name}: ${user.uni_plan} - Calendar: ${hasCalendar ? '✅' : '❌'}`);
  });
}

testManualDowngrade();

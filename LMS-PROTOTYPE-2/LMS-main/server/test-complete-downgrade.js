const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/lms-database.sqlite');
const planInheritance = require('./controllers/plan-inheritance-controller');

console.log('🧪 Testing Complete Automatic Downgrade Flow\n');
console.log('=' .repeat(60));

async function testCompleteDowngrade() {
  try {
    // Step 1: Show initial state
    console.log('1️⃣ INITIAL STATE (Professional Plan):');
    console.log('-' .repeat(50));
    
    const initialState = await getCurrentState();
    displayUsersState(initialState, 'Initial');
    
    // Step 2: Simulate plan expiration
    console.log('\n2️⃣ SIMULATING PLAN EXPIRATION...');
    console.log('-' .repeat(50));
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE subscriptions 
        SET expiryDate = ?, status = 'expired'
        WHERE superadminId = '33'
      `, [yesterday.toISOString()], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    console.log(`✅ SuperAdmin 33 plan expired (${yesterday.toLocaleDateString()})`);
    
    // Step 3: Test what API returns BEFORE downgrade
    console.log('\n3️⃣ API RESPONSE BEFORE AUTOMATIC DOWNGRADE:');
    console.log('-' .repeat(50));
    
    const apiResponseBefore = await planInheritance.getEffectiveUserPlan(22);
    console.log(`📋 User 22 (Aniket2): ${apiResponseBefore.planName} - Calendar: ${apiResponseBefore.canAccessCalendar ? '✅' : '❌'}`);
    
    // Step 4: Run automatic downgrade
    console.log('\n4️⃣ RUNNING AUTOMATIC DOWNGRADE...');
    console.log('-' .repeat(50));
    
    const downgradeResult = await planInheritance.checkExpiredSubscriptions();
    console.log(`📊 Downgrade Result:`, downgradeResult);
    
    // Step 5: Test what API returns AFTER downgrade
    console.log('\n5️⃣ API RESPONSE AFTER AUTOMATIC DOWNGRADE:');
    console.log('-' .repeat(50));
    
    const apiResponseAfter = await planInheritance.getEffectiveUserPlan(22);
    console.log(`📋 User 22 (Aniket2): ${apiResponseAfter.planName} - Calendar: ${apiResponseAfter.canAccessCalendar ? '✅' : '❌'}`);
    
    // Step 6: Check final database state
    console.log('\n6️⃣ FINAL DATABASE STATE:');
    console.log('-' .repeat(50));
    
    // Wait a moment for DB operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalState = await getCurrentState();
    displayUsersState(finalState, 'Final');
    
    // Step 7: Summary
    console.log('\n🎯 COMPLETE DOWNGRADE TEST SUMMARY:');
    console.log('=' .repeat(60));
    
    const allDowngraded = finalState.every(user => user.uni_plan === 'free');
    const calendarLocked = !apiResponseAfter.canAccessCalendar;
    
    if (allDowngraded && calendarLocked) {
      console.log('✅ SUCCESS: Complete automatic downgrade working!');
      console.log('✅ All users downgraded to Free plan in database');
      console.log('✅ API correctly returns Free plan');
      console.log('✅ Calendar feature locked for all users');
      console.log('✅ Frontend will show upgrade popup');
      console.log('');
      console.log('🔄 What happens in real-time:');
      console.log('   1. SuperAdmin plan expires');
      console.log('   2. Scheduler detects expiration (every hour)');
      console.log('   3. Automatic downgrade runs');
      console.log('   4. All users immediately lose calendar access');
      console.log('   5. Frontend shows upgrade popup on next calendar visit');
    } else {
      console.log('❌ ISSUE: Some parts not working correctly');
      console.log(`   All downgraded: ${allDowngraded ? '✅' : '❌'}`);
      console.log(`   Calendar locked: ${calendarLocked ? '✅' : '❌'}`);
    }
    
    // Step 8: Restore for continued testing
    console.log('\n🔄 RESTORING PROFESSIONAL PLAN...');
    console.log('-' .repeat(50));
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE subscriptions 
        SET planType = 'professional', planName = 'Professional Plan', 
             status = 'active', expiryDate = ?
        WHERE superadminId = '33'
      `, [futureDate.toISOString()], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    await planInheritance.propagatePlanToUsers('33', 'professional', 'Professional Plan', futureDate.toISOString());
    
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

testCompleteDowngrade();

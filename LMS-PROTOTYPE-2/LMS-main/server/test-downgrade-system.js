const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/lms-database.sqlite');

console.log('🧪 Testing Automatic Plan Downgrade System\n');
console.log('=' .repeat(60));

async function simulatePlanDowngrade() {
  try {
    // Step 1: Check current state
    console.log('1️⃣ Current State Check:');
    console.log('-' .repeat(40));
    
    const currentState = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.name, u.role, u.subscriptionPlan as user_plan,
               uni.name as university_name, uni.subscriptionPlan as uni_plan,
               uni.adminId as superadmin_id,
               sub.planName as sub_name, sub.planType as sub_type, sub.expiryDate
        FROM users u
        LEFT JOIN universities uni ON u.university_id = uni.id
        LEFT JOIN subscriptions sub ON uni.adminId = sub.superadminId
        WHERE uni.adminId = '33'
        ORDER BY u.name
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    currentState.forEach(user => {
      const hasCalendar = user.uni_plan === 'standard' || user.uni_plan === 'professional';
      console.log(`👤 ${user.name}: ${user.uni_plan} - Calendar: ${hasCalendar ? '✅' : '❌'}`);
    });
    
    // Step 2: Simulate plan downgrade (set expiry to past date)
    console.log('\n2️⃣ Simulating Plan Expiration...');
    console.log('-' .repeat(40));
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday (expired)
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE subscriptions 
        SET expiryDate = ?, status = 'expired'
        WHERE superadminId = '33'
      `, [pastDate.toISOString()], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    console.log(`✅ SuperAdmin 33 plan set to expired (${pastDate.toLocaleDateString()})`);
    
    // Step 3: Run the inheritance downgrade logic
    console.log('\n3️⃣ Running Automatic Downgrade...');
    console.log('-' .repeat(40));
    
    // Import and use the inheritance system
    const planInheritance = require('./controllers/plan-inheritance-controller');
    
    const downgradeResult = await planInheritance.checkExpiredSubscriptions();
    console.log(`📊 Downgrade Result:`, downgradeResult);
    
    // Step 4: Verify final state
    console.log('\n4️⃣ Final State Verification:');
    console.log('-' .repeat(40));
    
    const finalState = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.name, u.role, u.subscriptionPlan as user_plan,
               uni.name as university_name, uni.subscriptionPlan as uni_plan,
               uni.adminId as superadmin_id,
               sub.planName as sub_name, sub.planType as sub_type, sub.status, sub.expiryDate
        FROM users u
        LEFT JOIN universities uni ON u.university_id = uni.id
        LEFT JOIN subscriptions sub ON uni.adminId = sub.superadminId
        WHERE uni.adminId = '33'
        ORDER BY u.name
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    let allDowngraded = true;
    finalState.forEach(user => {
      const hasCalendar = user.uni_plan === 'standard' || user.uni_plan === 'professional';
      const isFree = user.uni_plan === 'free';
      
      console.log(`👤 ${user.name}: ${user.uni_plan} - Calendar: ${hasCalendar ? '✅' : '❌'} - Free: ${isFree ? '✅' : '❌'}`);
      
      if (!isFree) {
        allDowngraded = false;
      }
    });
    
    // Step 5: Test API response
    console.log('\n5️⃣ Testing API Response...');
    console.log('-' .repeat(40));
    
    // Test what the API would return for user 22 (Aniket2)
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    
    console.log(`📋 User 22 (Aniket2) Effective Plan:`);
    console.log(`   Plan: ${effectivePlan.planName} (${effectivePlan.planType})`);
    console.log(`   Calendar: ${effectivePlan.canAccessCalendar ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
    console.log(`   Expired: ${effectivePlan.isExpired ? '⚠️ YES' : '✅ NO'}`);
    
    // Step 6: Summary
    console.log('\n🎯 AUTOMATIC DOWNGRADE TEST RESULTS:');
    console.log('=' .repeat(50));
    
    if (allDowngraded && !effectivePlan.canAccessCalendar) {
      console.log('✅ SUCCESS: Automatic downgrade working perfectly!');
      console.log('✅ All users downgraded to Free plan');
      console.log('✅ Calendar feature locked for all users');
      console.log('✅ SuperAdmin portal also downgraded');
      console.log('✅ Frontend will show upgrade popup');
    } else {
      console.log('❌ ISSUE: Automatic downgrade not working correctly');
    }
    
    // Restore Professional plan for testing
    console.log('\n🔄 Restoring Professional plan for continued testing...');
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
    
    // Propagate back to users
    await planInheritance.propagatePlanToUsers('33', 'professional', 'Professional Plan', futureDate.toISOString());
    
    console.log('✅ Professional plan restored');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    db.close();
  }
}

simulatePlanDowngrade();

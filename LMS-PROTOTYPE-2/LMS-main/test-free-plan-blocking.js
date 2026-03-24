const db = require('./server/config/sqlite-db');

console.log('🧪 TESTING FREE PLAN CALENDAR BLOCKING...\n');

async function testFreePlanBlocking() {
  try {
    // Step 1: Force SuperAdmin to Free plan
    console.log('1️⃣ Forcing SuperAdmin 33 to FREE plan...');
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE subscriptions 
        SET planType = 'free', planName = 'Free', updatedAt = ?
        WHERE superadminId = 33
      `, [new Date().toISOString()], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    console.log('   ✅ SuperAdmin downgraded to FREE plan');
    
    // Step 2: Force ALL users to Free plan
    console.log('\n2️⃣ Forcing ALL users to FREE plan...');
    
    const updateResult = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET subscriptionPlan = 'free', updatedAt = ?
        WHERE university_id IN (
          SELECT id FROM universities WHERE adminId = 33
        )
      `, [new Date().toISOString()], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    console.log(`   ✅ Updated ${updateResult.changes} users to FREE plan`);
    
    // Step 3: Verify all users are now Free
    console.log('\n3️⃣ Verifying all users are FREE plan:');
    
    const allUsers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.name, u.subscriptionPlan
        FROM users u
        LEFT JOIN universities uni ON u.university_id = uni.id
        WHERE uni.adminId = 33
        ORDER BY u.name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('   User plans:');
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (ID: ${user.id}): ${user.subscriptionPlan}`);
    });
    
    // Step 4: Test effective plan for Aniket2
    console.log('\n4️⃣ Testing effective plan for Aniket2:');
    
    const planInheritance = require('./server/controllers/plan-inheritance-controller');
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    console.log(`   Aniket2 effective plan: ${effectivePlan.planType}`);
    console.log(`   Can access calendar: ${effectivePlan.canAccessCalendar}`);
    
    // Step 5: Test calendar middleware for Aniket2
    console.log('\n5️⃣ Testing calendar middleware for Aniket2:');
    
    const quotaMiddleware = require('./server/middleware/quotaMiddleware');
    
    const mockReq = {
      user: { userId: 22 }
    };
    
    let blocked = false;
    let allowed = false;
    
    const mockRes = {
      status: (code) => {
        console.log(`   Middleware responded with status: ${code}`);
        if (code === 402) {
          blocked = true;
          console.log('   ✅ Access correctly BLOCKED');
        } else if (code === 200) {
          allowed = true;
          console.log('   ❌ Access incorrectly ALLOWED');
        }
      },
      json: (data) => {
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    };
    
    await new Promise((resolve) => {
      quotaMiddleware.checkCalendarAccess(mockReq, mockRes, () => {
        allowed = true;
        console.log('   ❌ Access incorrectly ALLOWED (next() called)');
        resolve();
      });
    });
    
    // Step 6: Test middleware for ALL users
    console.log('\n6️⃣ Testing calendar middleware for ALL users:');
    
    for (const user of allUsers) {
      const userPlan = await planInheritance.getEffectiveUserPlan(user.id);
      console.log(`   ${user.name}: ${userPlan.planType} -> Calendar: ${userPlan.canAccessCalendar ? 'ALLOWED' : 'BLOCKED'}`);
    }
    
    // Step 7: Analysis
    console.log('\n🎯 CRITICAL ANALYSIS:');
    console.log(`SuperAdmin plan: FREE`);
    console.log(`Expected calendar access: BLOCKED`);
    console.log(`Actual calendar access: ${blocked ? 'BLOCKED' : 'ALLOWED'}`);
    
    if (blocked === false && allowed === true) {
      console.log('\n🚨 MAJOR PROBLEM IDENTIFIED:');
      console.log('   ❌ SuperAdmin has FREE plan but users can still access calendar');
      console.log('   ❌ This means the quota middleware is NOT working correctly');
      console.log('   ❌ The calendar blocking system is broken');
      
      console.log('\n🔧 IMMEDIATE FIX REQUIRED:');
      console.log('   1. RESTART SERVER: npm restart or node server.js');
      console.log('   2. CHECK quotaMiddleware.js for errors');
      console.log('   3. VERIFY QUOTAS.free.calendarAccess = false');
      console.log('   4. CLEAR BROWSER CACHE: Ctrl+F5');
      
    } else if (blocked === true) {
      console.log('\n✅ SUCCESS: Calendar access correctly BLOCKED for free plan');
      console.log('   The system is working correctly!');
    }
    
    // Step 8: Restore to Standard plan
    console.log('\n7️⃣ Restoring to Standard plan for testing...');
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE subscriptions 
        SET planType = 'standard', planName = 'Standard Plan', updatedAt = ?
        WHERE superadminId = 33
      `, [new Date().toISOString()], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET subscriptionPlan = 'standard', updatedAt = ?
        WHERE university_id IN (
          SELECT id FROM universities WHERE adminId = 33
        )
      `, [new Date().toISOString()], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    console.log('   ✅ Restored to Standard plan');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

testFreePlanBlocking();

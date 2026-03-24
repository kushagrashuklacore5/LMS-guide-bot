const db = require('./server/config/sqlite-db');

console.log('🔧 FIXING CALENDAR ACCESS FOR ALL USERS UNDER SUPERADMIN 33...\n');

async function fixAllUsersCalendar() {
  try {
    // Step 1: Check current SuperAdmin plan
    console.log('1️⃣ Checking SuperAdmin 33 current plan:');
    const superadminSub = await new Promise((resolve, reject) => {
      db.get('SELECT planType, planName, status FROM subscriptions WHERE superadminId = 33 ORDER BY createdAt DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log(`   SuperAdmin plan: ${superadminSub.planName} (${superadminSub.planType})`);
    
    // Step 2: Check all users under SuperAdmin 33
    console.log('\n2️⃣ Checking all users under SuperAdmin 33:');
    const allUsers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.name, u.subscriptionPlan, u.updatedAt
        FROM users u
        LEFT JOIN universities uni ON u.university_id = uni.id
        WHERE uni.adminId = 33
        ORDER BY u.name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`   Found ${allUsers.length} users under SuperAdmin 33:`);
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (ID: ${user.id}): ${user.subscriptionPlan} (Updated: ${user.updatedAt})`);
    });
    
    // Step 3: Force update ALL users to match SuperAdmin plan
    console.log('\n3️⃣ Forcing ALL users to match SuperAdmin plan...');
    
    const updateResult = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET subscriptionPlan = ?, updatedAt = ?
        WHERE university_id IN (
          SELECT id FROM universities WHERE adminId = ?
        )
      `, [superadminSub.planType, new Date().toISOString(), 33], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    console.log(`   ✅ Updated ${updateResult.changes} users to ${superadminSub.planType} plan`);
    
    // Step 4: Verify updates
    console.log('\n4️⃣ Verifying updates:');
    const updatedUsers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.id, u.name, u.subscriptionPlan, u.updatedAt
        FROM users u
        LEFT JOIN universities uni ON u.university_id = uni.id
        WHERE uni.adminId = 33
        ORDER BY u.name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('   Updated user plans:');
    updatedUsers.forEach(user => {
      console.log(`   - ${user.name} (ID: ${user.id}): ${user.subscriptionPlan} (Updated: ${user.updatedAt})`);
    });
    
    // Step 5: Test calendar access for Aniket2 specifically
    console.log('\n5️⃣ Testing calendar access for Aniket2 (ID: 22):');
    
    const planInheritance = require('./server/controllers/plan-inheritance-controller');
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    console.log(`   Aniket2 effective plan: ${effectivePlan.planType}`);
    console.log(`   Can access calendar: ${effectivePlan.canAccessCalendar}`);
    
    // Step 6: Test calendar middleware directly
    console.log('\n6️⃣ Testing calendar middleware directly:');
    
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
    
    // Step 7: Test for all users
    console.log('\n7️⃣ Testing calendar access for ALL users:');
    
    for (const user of updatedUsers) {
      const userPlan = await planInheritance.getEffectiveUserPlan(user.id);
      console.log(`   ${user.name}: ${userPlan.planType} -> Calendar: ${userPlan.canAccessCalendar ? 'ALLOWED' : 'BLOCKED'}`);
    }
    
    // Step 8: Analysis and Fix
    console.log('\n🎯 ANALYSIS:');
    console.log(`SuperAdmin plan: ${superadminSub.planType}`);
    console.log(`Expected calendar access: ${superadminSub.planType === 'free' ? 'BLOCKED' : 'ALLOWED'}`);
    console.log(`Actual calendar access: ${allowed ? 'ALLOWED' : 'BLOCKED'}`);
    
    if (superadminSub.planType === 'free' && allowed === true) {
      console.log('\n🚨 PROBLEM IDENTIFIED:');
      console.log('   SuperAdmin has FREE plan but users can still access calendar');
      console.log('   This means the quota middleware is NOT working correctly');
      
      console.log('\n🔧 IMMEDIATE FIX:');
      console.log('   1. RESTART SERVER: npm restart or node server.js');
      console.log('   2. CLEAR BROWSER CACHE: Ctrl+F5');
      console.log('   3. CHECK SERVER LOGS for middleware errors');
      console.log('   4. VERIFY quotaMiddleware.js is properly loaded');
      
    } else if (superadminSub.planType === 'free' && blocked === true) {
      console.log('\n✅ SUCCESS: Calendar access correctly BLOCKED for free plan');
    } else if (superadminSub.planType === 'standard' && allowed === true) {
      console.log('\n✅ SUCCESS: Calendar access correctly ALLOWED for standard plan');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log(`   - SuperAdmin plan: ${superadminSub.planType}`);
    console.log(`   - All ${updatedUsers.length} users updated to match`);
    console.log(`   - Aniket2 calendar access: ${effectivePlan.canAccessCalendar ? 'ALLOWED' : 'BLOCKED'}`);
    console.log(`   - Middleware behavior: ${blocked ? 'BLOCKING' : 'ALLOWING'}`);
    
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. If middleware is not blocking correctly, RESTART SERVER');
    console.log('   2. Test calendar access in browser with Aniket2 account');
    console.log('   3. Clear browser cache if still seeing old behavior');
    console.log('   4. Check server console for any middleware errors');

  } catch (error) {
    console.error('❌ Fix error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

fixAllUsersCalendar();

const db = require('./server/config/sqlite-db');

console.log('🔍 Debugging Current Plan State...\n');

async function debugCurrentState() {
  try {
    // 1. Check SuperAdmin current subscription
    console.log('1️⃣ Checking SuperAdmin (ID: 33) subscription:');
    const superadminSub = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM subscriptions WHERE superadminId = 33 ORDER BY createdAt DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (superadminSub) {
      console.log(`   Plan: ${superadminSub.planName} (${superadminSub.planType})`);
      console.log(`   Status: ${superadminSub.status}`);
      console.log(`   Expiry: ${superadminSub.expiryDate}`);
      console.log(`   Updated: ${superadminSub.updatedAt}`);
    } else {
      console.log('   ❌ No subscription found for SuperAdmin 33');
    }

    // 2. Check University plan
    console.log('\n2️⃣ Checking University (ID: 4) plan:');
    const university = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM universities WHERE id = 4', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (university) {
      console.log(`   University: ${university.name}`);
      console.log(`   Admin ID: ${university.adminId}`);
      console.log(`   Plan: ${university.subscriptionPlan}`);
    } else {
      console.log('   ❌ University 4 not found');
    }

    // 3. Check users under University 4
    console.log('\n3️⃣ Checking users under University 4:');
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, role, subscriptionPlan FROM users WHERE university_id = 4', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    users.forEach(user => {
      console.log(`   👤 ${user.name} (${user.email}) - Role: ${user.role}`);
      console.log(`      Plan: ${user.subscriptionPlan}`);
    });

    // 4. Check effective plan for a sample user
    console.log('\n4️⃣ Checking effective plan for user Aniket2 (ID: 22):');
    const planInheritance = require('./server/controllers/plan-inheritance-controller');
    
    try {
      const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
      console.log(`   Effective Plan: ${effectivePlan.planType}`);
      console.log(`   Can Access Calendar: ${effectivePlan.canAccessCalendar}`);
      console.log(`   Is Expired: ${effectivePlan.isExpired}`);
      console.log(`   Plan Source: ${effectivePlan.planName}`);
    } catch (error) {
      console.log(`   ❌ Error getting effective plan: ${error.message}`);
    }

    // 5. Check if plan monitor is running
    console.log('\n5️⃣ Checking plan monitor status:');
    try {
      const planMonitor = require('./server/schedulers/plan-monitor');
      const status = planMonitor.getStatus();
      console.log(`   Monitor Running: ${status.isRunning}`);
      console.log(`   Cached Plans: ${status.cachedPlans}`);
      console.log(`   Last Check: ${status.lastCheckTime}`);
      
      // Check cached plan for SuperAdmin 33
      const cachedPlan = planMonitor.getCachedPlan(33);
      if (cachedPlan) {
        console.log(`   Cached Plan for 33: ${cachedPlan.planType} (${cachedPlan.planName})`);
      } else {
        console.log('   ❌ No cached plan for SuperAdmin 33');
      }
    } catch (error) {
      console.log(`   ❌ Plan monitor not accessible: ${error.message}`);
    }

    // 6. Force manual propagation if needed
    console.log('\n6️⃣ Forcing manual plan propagation...');
    if (superadminSub && superadminSub.planType !== 'free') {
      try {
        const result = await planInheritance.propagatePlanToUsers(
          33, 
          superadminSub.planType, 
          superadminSub.planName, 
          superadminSub.expiryDate
        );
        console.log(`   ✅ Manual propagation completed:`);
        console.log(`      Universities updated: ${result.universitiesUpdated}`);
        console.log(`      Users updated: ${result.usersUpdated}`);
        
        // Check again after propagation
        console.log('\n7️⃣ Checking state after manual propagation:');
        const updatedUsers = await new Promise((resolve, reject) => {
          db.all('SELECT id, name, subscriptionPlan FROM users WHERE university_id = 4', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
        
        updatedUsers.forEach(user => {
          console.log(`   👤 ${user.name} - Plan: ${user.subscriptionPlan}`);
        });
        
      } catch (error) {
        console.log(`   ❌ Manual propagation failed: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

debugCurrentState();

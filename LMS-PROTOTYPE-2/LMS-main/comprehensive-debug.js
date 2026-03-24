const db = require('./server/config/sqlite-db');

console.log('🔍 COMPREHENSIVE DEBUG - Finding the Real Issue...\n');

async function comprehensiveDebug() {
  try {
    // Step 1: Check EXACT current state
    console.log('1️⃣ EXACT CURRENT STATE:');
    
    const superadminSub = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM subscriptions WHERE superadminId = 33 ORDER BY createdAt DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('SuperAdmin 33 Subscription:');
    console.log(`   ID: ${superadminSub.id}`);
    console.log(`   Plan: ${superadminSub.planName} (${superadminSub.planType})`);
    console.log(`   Status: ${superadminSub.status}`);
    console.log(`   Expiry: ${superadminSub.expiryDate}`);
    console.log(`   Updated: ${superadminSub.updatedAt}`);
    
    const university = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM universities WHERE id = 4', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('\nUniversity 4:');
    console.log(`   Name: ${university.name}`);
    console.log(`   Admin ID: ${university.adminId}`);
    console.log(`   Plan: ${university.subscriptionPlan}`);
    console.log(`   Updated: ${university.updatedAt}`);
    
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM users WHERE university_id = 4', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('\nUsers under University 4:');
    users.forEach(user => {
      console.log(`   ${user.name} (ID: ${user.id}) - Plan: ${user.subscriptionPlan} - Updated: ${user.updatedAt}`);
    });

    // Step 2: Check if propagation is actually needed
    console.log('\n2️⃣ CHECKING IF PROPAGATION IS NEEDED:');
    
    const needsPropagation = users.some(user => user.subscriptionPlan !== superadminSub.planType);
    console.log(`Propagation needed: ${needsPropagation}`);
    
    if (!needsPropagation) {
      console.log('✅ All users already have correct plan - no propagation needed');
      return;
    }

    // Step 3: Force manual propagation with detailed logging
    console.log('\n3️⃣ FORCING MANUAL PROPAGATION:');
    
    const planInheritance = require('./server/controllers/plan-inheritance-controller');
    
    console.log('Calling propagatePlanToUsers...');
    const result = await planInheritance.propagatePlanToUsers(
      33, 
      superadminSub.planType, 
      superadminSub.planName, 
      superadminSub.expiryDate
    );
    
    console.log('Propagation result:');
    console.log(`   Universities updated: ${result.universitiesUpdated}`);
    console.log(`   Users updated: ${result.usersUpdated}`);
    console.log(`   Duration: ${result.duration}ms`);

    // Step 4: IMMEDIATE verification after propagation
    console.log('\n4️⃣ IMMEDIATE VERIFICATION AFTER PROPAGATION:');
    
    const updatedUniversity = await new Promise((resolve, reject) => {
      db.get('SELECT subscriptionPlan, updatedAt FROM universities WHERE id = 4', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log(`University plan after propagation: ${updatedUniversity.subscriptionPlan}`);
    console.log(`University updated at: ${updatedUniversity.updatedAt}`);
    
    const updatedUsers = await new Promise((resolve, reject) => {
      db.all('SELECT name, subscriptionPlan, updatedAt FROM users WHERE university_id = 4', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('User plans after propagation:');
    updatedUsers.forEach(user => {
      console.log(`   ${user.name} - Plan: ${user.subscriptionPlan} - Updated: ${user.updatedAt}`);
    });

    // Step 5: Check if propagation actually worked
    console.log('\n5️⃣ DID PROPAGATION ACTUALLY WORK?');
    
    const propagationWorked = updatedUsers.every(user => user.subscriptionPlan === superadminSub.planType);
    console.log(`Propagation successful: ${propagationWorked}`);
    
    if (!propagationWorked) {
      console.log('❌ PROPAGATION FAILED - Investigating...');
      
      // Check if there are any users not under University 4
      const otherUsers = await new Promise((resolve, reject) => {
        db.all('SELECT id, name, university_id, subscriptionPlan FROM users WHERE university_id != 4', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      console.log(`Found ${otherUsers.length} users not under University 4`);
      
      // Check if there are multiple universities for SuperAdmin 33
      const universities = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM universities WHERE adminId = 33', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      console.log(`Found ${universities.length} universities for SuperAdmin 33:`);
      universities.forEach(uni => {
        console.log(`   ${uni.name} (ID: ${uni.id}) - Plan: ${uni.subscriptionPlan}`);
      });
      
      // Try direct SQL update as fallback
      console.log('\n🔧 TRYING DIRECT SQL UPDATE AS FALLBACK:');
      
      const directUpdate = await new Promise((resolve, reject) => {
        db.run(`
          UPDATE users 
          SET subscriptionPlan = ?, updatedAt = ?
          WHERE university_id IN (SELECT id FROM universities WHERE adminId = ?)
        `, [superadminSub.planType, new Date().toISOString(), 33], function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        });
      });
      
      console.log(`Direct SQL update affected ${directUpdate.changes} users`);
      
      // Final verification
      const finalUsers = await new Promise((resolve, reject) => {
        db.all('SELECT name, subscriptionPlan FROM users WHERE university_id = 4', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      console.log('Final user plans after direct update:');
      finalUsers.forEach(user => {
        console.log(`   ${user.name} - Plan: ${user.subscriptionPlan}`);
      });
    }

    // Step 6: Test effective plan
    console.log('\n6️⃣ TESTING EFFECTIVE PLAN:');
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    console.log(`Aniket2 effective plan: ${effectivePlan.planType}`);
    console.log(`Can access calendar: ${effectivePlan.canAccessCalendar}`);

  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
  }
  
  setTimeout(() => process.exit(0), 3000);
}

comprehensiveDebug();

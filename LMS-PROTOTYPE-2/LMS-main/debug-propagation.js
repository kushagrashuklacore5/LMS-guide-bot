const db = require('./server/config/sqlite-db');
const planInheritance = require('./server/controllers/plan-inheritance-controller');

console.log('🔍 Debugging Plan Propagation...\n');

async function debugPropagation() {
  try {
    // Step 1: Check current state
    console.log('1️⃣ Current state before propagation:');
    const subscription = await new Promise((resolve, reject) => {
      db.get('SELECT planType, planName, status FROM subscriptions WHERE superadminId = 33', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log(`SuperAdmin subscription: ${subscription.planName} (${subscription.planType})`);
    
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT name, subscriptionPlan FROM users WHERE university_id = 4', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('Current user plans:');
    users.forEach(user => {
      console.log(`   ${user.name}: ${user.subscriptionPlan}`);
    });

    // Step 2: Test direct propagation
    console.log('\n2️⃣ Testing direct plan propagation...');
    
    const result = await planInheritance.propagatePlanToUsers(
      33, 
      subscription.planType, 
      subscription.planName, 
      new Date().toISOString()
    );
    
    console.log(`Propagation result:`);
    console.log(`   Universities updated: ${result.universitiesUpdated}`);
    console.log(`   Users updated: ${result.usersUpdated}`);
    console.log(`   Duration: ${result.duration}ms`);

    // Step 3: Check state after propagation
    console.log('\n3️⃣ State after propagation:');
    
    const updatedUsers = await new Promise((resolve, reject) => {
      db.all('SELECT name, subscriptionPlan FROM users WHERE university_id = 4', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('Updated user plans:');
    updatedUsers.forEach(user => {
      console.log(`   ${user.name}: ${user.subscriptionPlan}`);
    });

    // Step 4: Test effective plan
    console.log('\n4️⃣ Testing effective plan:');
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    console.log(`Aniket2 effective plan: ${effectivePlan.planType}`);
    console.log(`Can access calendar: ${effectivePlan.canAccessCalendar}`);

    // Step 5: Now test plan monitor specifically
    console.log('\n5️⃣ Testing plan monitor detection...');
    
    // Force a change in the database to trigger monitor
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);
    
    await new Promise((resolve, reject) => {
      db.run('UPDATE subscriptions SET expiryDate = ?, updatedAt = ? WHERE superadminId = 33', 
        [newExpiry.toISOString(), new Date().toISOString()], 
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
    
    console.log('✅ Updated subscription expiry to trigger monitor');
    
    // Now trigger plan monitor
    const planMonitor = require('./server/schedulers/plan-monitor');
    console.log('🔄 Forcing plan monitor check...');
    await planMonitor.forceCheck();
    
    console.log('\n6️⃣ Final state after monitor check:');
    const finalUsers = await new Promise((resolve, reject) => {
      db.all('SELECT name, subscriptionPlan FROM users WHERE university_id = 4', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log('Final user plans:');
    finalUsers.forEach(user => {
      console.log(`   ${user.name}: ${user.subscriptionPlan}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

debugPropagation();

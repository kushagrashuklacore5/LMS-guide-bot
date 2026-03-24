const db = require('./server/config/sqlite-db');

// Debug script to check subscription and plan inheritance data
async function debugSubscriptionData() {
  console.log('🔍 Debugging Subscription Data...\n');
  
  // Check 1: Look at subscriptions table
  console.log('1️⃣ Checking subscriptions table:');
  db.all('SELECT * FROM subscriptions', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    if (rows.length === 0) {
      console.log('❌ No subscriptions found');
    } else {
      rows.forEach(row => {
        console.log(`📋 Subscription: ${row.superadminId} - ${row.planName} (${row.planType}) - Status: ${row.status}`);
        console.log(`   Expiry: ${row.expiryDate}`);
        console.log(`   Is Free Trial: ${row.isFreeTrial}`);
      });
    }
    
    // Check 2: Look at users table
    console.log('\n2️⃣ Checking users table:');
    db.all('SELECT id, name, email, role, university_id, subscriptionPlan FROM users LIMIT 10', (err, users) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      users.forEach(user => {
        console.log(`👤 User: ${user.name} (${user.email}) - Role: ${user.role}`);
        console.log(`   University: ${user.university_id}, Plan: ${user.subscriptionPlan}`);
      });
      
      // Check 3: Look at universities table
      console.log('\n3️⃣ Checking universities table:');
      db.all('SELECT * FROM universities', (err, universities) => {
        if (err) {
          console.error('Error:', err);
          return;
        }
        
        universities.forEach(uni => {
          console.log(`🏢 University: ${uni.name} - Admin: ${uni.adminId}, Plan: ${uni.subscriptionPlan}`);
        });
        
        // Check 4: Test plan inheritance for a sample user
        console.log('\n4️⃣ Testing plan inheritance system:');
        const planInheritance = require('./server/controllers/plan-inheritance-controller');
        
        if (users.length > 0) {
          const testUser = users[0];
          console.log(`Testing for user: ${testUser.name} (ID: ${testUser.id})`);
          
          planInheritance.getEffectiveUserPlan(testUser.id)
            .then(userPlan => {
              console.log('📊 Effective User Plan:', {
                planType: userPlan.planType,
                planName: userPlan.planName,
                status: userPlan.status,
                canAccessCalendar: userPlan.canAccessCalendar,
                isExpired: userPlan.isExpired,
                expiryDate: userPlan.expiryDate
              });
              
              if (userPlan.canAccessCalendar === false) {
                console.log('✅ Calendar should be blocked for this user');
              } else {
                console.log('ℹ️ Calendar should be allowed for this user');
              }
              
              // Close database connection
              setTimeout(() => process.exit(0), 1000);
            })
            .catch(err => {
              console.error('❌ Error getting effective plan:', err);
              setTimeout(() => process.exit(0), 1000);
            });
        } else {
          console.log('❌ No users found to test plan inheritance');
          setTimeout(() => process.exit(0), 1000);
        }
      });
    });
  });
}

// Run the debug
debugSubscriptionData();

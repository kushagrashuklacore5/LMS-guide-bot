const masterDb = require('./config/database-switch');

async function testAuthDebug() {
  console.log('🔍 Testing Auth Controller Database Query...\n');
  
  // Test the exact query used in auth controller
  console.log('📊 Testing masterDb query...');
  masterDb.get("SELECT * FROM users WHERE email = ?", ['debugmentor@pro.com'], (err, user) => {
    if (err) {
      console.error('❌ Database error:', err);
    } else if (user) {
      console.log('✅ User found via masterDb:');
      console.log('   All fields:', Object.keys(user));
      console.log('   ID:', user.id);
      console.log('   Name:', user.name);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   University ID:', user.university_id);
      console.log('   Subscription Plan:', user.subscriptionPlan);
      console.log('   Is Approved:', user.isApproved);
      
      // Test if subscriptionPlan exists
      if (user.hasOwnProperty('subscriptionPlan')) {
        console.log('✅ subscriptionPlan field exists in masterDb result');
        console.log('📊 subscriptionPlan value:', user.subscriptionPlan);
        console.log('📊 subscriptionPlan type:', typeof user.subscriptionPlan);
      } else {
        console.log('❌ subscriptionPlan field missing from masterDb result');
      }
      
    } else {
      console.log('❌ User not found via masterDb');
    }
  });
  
  // Also test with sqlite-db directly
  console.log('\n📊 Testing sqliteDb directly...');
  const db = require('./config/database-switch');
  db.get("SELECT * FROM users WHERE email = ?", ['debugmentor@pro.com'], (err, user) => {
    if (err) {
      console.error('❌ Database error:', err);
    } else if (user) {
      console.log('✅ User found via sqliteDb:');
      console.log('   All fields:', Object.keys(user));
      console.log('   ID:', user.id);
      console.log('   Name:', user.name);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   University ID:', user.university_id);
      console.log('   Subscription Plan:', user.subscriptionPlan);
      console.log('   Is Approved:', user.isApproved);
      
      // Test if subscriptionPlan exists
      if (user.hasOwnProperty('subscriptionPlan')) {
        console.log('✅ subscriptionPlan field exists in sqliteDb result');
        console.log('📊 subscriptionPlan value:', user.subscriptionPlan);
        console.log('📊 subscriptionPlan type:', typeof user.subscriptionPlan);
      } else {
        console.log('❌ subscriptionPlan field missing from sqliteDb result');
      }
      
    } else {
      console.log('❌ User not found via sqliteDb');
    }
  });
  
  console.log('\n🎯 COMPARISON ANALYSIS:');
  console.log('If masterDb and sqliteDb return different results, there might be a database connection issue');
}

testAuthDebug();

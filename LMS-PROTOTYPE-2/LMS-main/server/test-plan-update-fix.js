// Test the fix by manually updating SuperAdmin-33 to Free plan
const db = require('./config/sqlite-db');
const planInheritance = require('./controllers/plan-inheritance-controller');

console.log('🔧 Testing Plan Update Fix\n');

// Update SuperAdmin-33 to Free plan
const updateQuery = `
  UPDATE subscriptions 
  SET planType = 'free', 
      planName = 'Free', 
      status = 'active',
      expiryDate = datetime('now', '+30 days'),
      updatedAt = datetime('now')
  WHERE superadminId = 'superadmin-33'
`;

db.run(updateQuery, (err) => {
  if (err) {
    console.error('❌ Error updating subscription:', err);
    return;
  }
  
  console.log('✅ Updated SuperAdmin-33 to Free plan');
  
  // Trigger immediate propagation
  const planInheritance = require('./plan-inheritance-controller');
  
  planInheritance.propagatePlanToUsers('superadmin-33', 'free', 'Free', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
    .then(result => {
      console.log('📊 Propagation result:', result);
      
      // Check the final state
      db.get('SELECT planType, planName, status FROM subscriptions WHERE superadminId = "superadmin-33"', (err, row) => {
        if (err) {
          console.error('❌ Error checking result:', err);
        } else {
          console.log('🎯 Final SuperAdmin-33 state:');
          console.log(`   Plan: ${row.planName} (${row.planType})`);
          console.log(`   Status: ${row.status}`);
          console.log(`   Should affect: Aniket2, manoj, teacher, student42, Nitish`);
          console.log(`   Expected: Calendar access BLOCKED for all these users`);
        }
        
        db.close();
      });
    })
    .catch(error => {
      console.error('❌ Propagation failed:', error);
    });
});

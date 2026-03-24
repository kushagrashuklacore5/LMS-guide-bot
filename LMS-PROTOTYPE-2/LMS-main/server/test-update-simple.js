// Simple test to update SuperAdmin-33 to Free plan
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'lms-database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Testing Plan Update Fix\n');

// Update SuperAdmin-33 to Free plan
const updateQuery = `
  UPDATE subscriptions 
  SET planType = 'free', 
      planName = 'Free', 
      status = 'active',
      updatedAt = datetime('now')
  WHERE superadminId = 'superadmin-33'
`;

db.run(updateQuery, (err) => {
  if (err) {
    console.error('❌ Error updating subscription:', err);
    return;
  }
  
  console.log('✅ Updated SuperAdmin-33 to Free plan');
  
  // Check the result
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
});

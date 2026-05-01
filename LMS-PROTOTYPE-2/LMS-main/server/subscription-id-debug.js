const db = require('./config/database-switch');

console.log('=== Debugging Subscription ID Issues ===');

// Check all subscriptions in the table
const allSubsQuery = `
  SELECT * FROM subscriptions 
  ORDER BY createdAt DESC
  LIMIT 10
`;

db.all(allSubsQuery, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log(`\nAll recent subscriptions:`);
    rows.forEach(row => {
      console.log(`- ID: ${row.id}, SuperAdminId: ${row.superadminId}, UserId: ${row.userId}, Plan: ${row.planName}, Created: ${row.createdAt}`);
    });
  }

  // Test the findSubscriptionById logic manually
  console.log('\n=== Testing findSubscriptionById logic ===');
  
  const testUserId = 69;
  console.log(`Testing with userId: ${testUserId}`);
  
  // Simulate the logic from findSubscriptionById
  let superadminId = testUserId;
  const userIdStr = String(testUserId);
  
  if (userIdStr.startsWith('superadmin-')) {
    superadminId = userIdStr;
    console.log(`Using existing superadminId: ${superadminId}`);
  } else if (testUserId && parseInt(testUserId) > 10) {
    superadminId = `superadmin-${testUserId}`;
    console.log(`Converting to superadminId: ${superadminId}`);
  } else {
    console.log(`Using regular userId: ${testUserId}`);
  }
  
  console.log(`Final superadminId for query: ${superadminId}`);
  
  // Query with this ID
  const debugQuery = `
    SELECT * FROM subscriptions WHERE superadminId = ?
  `;
  
  db.get(debugQuery, [superadminId], (err, row) => {
    if (err) {
      console.error('Error in debug query:', err);
    } else {
      console.log(`Found subscription:`, row ? {
        id: row.id,
        superadminId: row.superadminId,
        planName: row.planName,
        status: row.status
      } : 'None');
    }
    
    process.exit(0);
  });
});

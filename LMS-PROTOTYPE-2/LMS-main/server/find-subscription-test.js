const db = require('./config/database-switch');

console.log('=== Find Subscription Test ===');

// Copy the findSubscriptionById function to test it directly
const findSubscriptionById = (userId) => {
  return new Promise((resolve, reject) => {
    let superadminId = userId;
    const userIdStr = String(userId);
    
    console.log(`[DEBUG] Input userId: ${userId}, userIdStr: ${userIdStr}`);
    
    if (userIdStr.startsWith('superadmin-')) {
      superadminId = userIdStr;
      console.log(`[DEBUG] Using existing superadminId: ${superadminId}`);
    } else if (userId && parseInt(userId) > 10) {
      superadminId = `superadmin-${userId}`;
      console.log(`[DEBUG] Converting to superadminId: ${superadminId}`);
    } else {
      console.log(`[DEBUG] Using regular userId: ${userId}`);
    }
    
    console.log(`[DEBUG] Looking for subscription with superadminId: ${superadminId}`);
    
    db.get(
      'SELECT * FROM subscriptions WHERE superadminId = ?',
      [superadminId],
      (err, row) => {
        if (err) {
          console.error('Error finding subscription:', err);
          reject(err);
        } else {
          console.log(`[DEBUG] Found subscription:`, row ? {
            id: row.id,
            superadminId: row.superadminId,
            planName: row.planName,
            status: row.status
          } : 'None');
          resolve(row);
        }
      }
    );
  });
};

async function testFindSubscription() {
  try {
    console.log('Testing findSubscriptionById function...');
    
    // Test 1: superadmin-69
    console.log('\n1. Testing with superadmin-69:');
    const result1 = await findSubscriptionById('superadmin-69');
    console.log('Result 1:', result1 ? 'Found' : 'Not found');
    
    // Test 2: 69
    console.log('\n2. Testing with 69:');
    const result2 = await findSubscriptionById(69);
    console.log('Result 2:', result2 ? 'Found' : 'Not found');
    
    // Test 3: "69"
    console.log('\n3. Testing with "69":');
    const result3 = await findSubscriptionById('69');
    console.log('Result 3:', result3 ? 'Found' : 'Not found');
    
    // Test 4: Check all subscriptions in database
    console.log('\n4. All subscriptions in database:');
    const allQuery = `SELECT * FROM subscriptions ORDER BY createdAt DESC LIMIT 5`;
    
    db.all(allQuery, [], (err, rows) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      rows.forEach(row => {
        console.log(`- ID: ${row.id}, SuperAdminId: "${row.superadminId}", Plan: ${row.planName}`);
      });
      
      console.log('\n=== Summary ===');
      console.log('superadmin-69:', result1 ? result1.planName : 'Not found');
      console.log('69 (number):', result2 ? result2.planName : 'Not found');
      console.log('69 (string):', result3 ? result3.planName : 'Not found');
      
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFindSubscription();

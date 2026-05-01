const db = require('./config/database-switch');

console.log('=== Direct Database Test ===');

async function testDirectDatabase() {
  try {
    console.log('Testing direct database operations...');
    
    // Test 1: Check current subscriptions
    console.log('\n1. Current subscriptions:');
    const selectQuery = `SELECT * FROM subscriptions WHERE superadminId LIKE '%69%' ORDER BY createdAt DESC LIMIT 5`;
    
    db.all(selectQuery, [], (err, rows) => {
      if (err) {
        console.error('Error selecting:', err);
        return;
      }
      
      console.log('Found subscriptions:', rows.length);
      rows.forEach(row => {
        console.log(`- ID: ${row.id}, SuperAdminId: "${row.superadminId}", Plan: ${row.planName}`);
      });
      
      // Test 2: Insert a test subscription
      console.log('\n2. Inserting test subscription...');
      const insertQuery = `
        INSERT OR REPLACE INTO subscriptions (
          superadminId, planType, planName, status, startDate, expiryDate,
          durationDays, paymentId, amount, currency, paymentMethod, isFreeTrial,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const testSubscription = {
        superadminId: 'superadmin-69',
        planType: 'standard',
        planName: 'Standard',
        status: 'active',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        durationDays: 30,
        paymentId: null,
        amount: 100,
        currency: 'INR',
        paymentMethod: null,
        isFreeTrial: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const params = [
        testSubscription.superadminId,
        testSubscription.planType,
        testSubscription.planName,
        testSubscription.status,
        testSubscription.startDate,
        testSubscription.expiryDate,
        testSubscription.durationDays,
        testSubscription.paymentId,
        testSubscription.amount,
        testSubscription.currency,
        testSubscription.paymentMethod,
        testSubscription.isFreeTrial,
        testSubscription.createdAt,
        testSubscription.updatedAt
      ];
      
      console.log('Insert params:', params);
      
      db.run(insertQuery, params, function(err) {
        if (err) {
          console.error('Error inserting:', err);
          return;
        }
        
        console.log('Insert successful! LastID:', this.lastID);
        
        // Test 3: Verify the insert
        console.log('\n3. Verifying insert...');
        db.all(selectQuery, [], (err, rows) => {
          if (err) {
            console.error('Error verifying:', err);
            return;
          }
          
          console.log('Subscriptions after insert:');
          rows.forEach(row => {
            console.log(`- ID: ${row.id}, SuperAdminId: "${row.superadminId}", Plan: ${row.planName}`);
          });
          
          process.exit(0);
        });
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDirectDatabase();

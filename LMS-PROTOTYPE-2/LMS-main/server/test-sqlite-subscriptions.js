#!/usr/bin/env node
/**
 * Test Script: Verify SQLite Subscriptions
 * Tests that subscriptions are working correctly in SQLite
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const sqlDbPath = path.join(__dirname, 'data', 'lms-database.sqlite');

// Connect to SQLite
const db = new sqlite3.Database(sqlDbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite:', sqlDbPath);
  runTests();
});

/**
 * Test 1: Check if subscriptions table exists
 */
function testTableExists() {
  return new Promise((resolve) => {
    db.all(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND name='subscriptions'",
      [],
      (err, rows) => {
        if (err) {
          console.error('❌ Test 1 Failed:', err.message);
          resolve(false);
        } else if (rows && rows.length > 0) {
          console.log('✅ Test 1 Passed: subscriptions table exists');
          resolve(true);
        } else {
          console.error('❌ Test 1 Failed: subscriptions table not found');
          resolve(false);
        }
      }
    );
  });
}

/**
 * Test 2: Check table structure
 */
function testTableStructure() {
  return new Promise((resolve) => {
    db.all(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'subscriptions)",
      [],
      (err, rows) => {
        if (err) {
          console.error('❌ Test 2 Failed:', err.message);
          resolve(false);
        } else {
          const requiredColumns = [
            'superadminId', 'planType', 'planName', 'status',
            'startDate', 'expiryDate', 'durationDays', 'paymentId',
            'amount', 'currency', 'paymentMethod', 'isFreeTrial'
          ];
          
          const foundColumns = rows.map(r => r.name);
          const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col));
          
          if (missingColumns.length === 0) {
            console.log('✅ Test 2 Passed: All required columns exist');
            console.log('   Columns:', foundColumns.join(', '));
            resolve(true);
          } else {
            console.error('❌ Test 2 Failed: Missing columns:', missingColumns.join(', '));
            resolve(false);
          }
        }
      }
    );
  });
}

/**
 * Test 3: Insert a test subscription
 */
function testInsertSubscription() {
  return new Promise((resolve) => {
    const testData = {
      superadminId: 'test-superadmin-' + Date.now(),
      planType: 'standard',
      planName: 'Standard',
      status: 'active',
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      durationDays: 30,
      paymentId: 'test_pay_' + Date.now(),
      amount: 50000,
      currency: 'INR',
      paymentMethod: 'razorpay',
      isFreeTrial: 0
    };

    db.run(
      `INSERT INTO subscriptions (
        superadminId, planType, planName, status, startDate, expiryDate,
        durationDays, paymentId, amount, currency, paymentMethod, isFreeTrial,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testData.superadminId,
        testData.planType,
        testData.planName,
        testData.status,
        testData.startDate,
        testData.expiryDate,
        testData.durationDays,
        testData.paymentId,
        testData.amount,
        testData.currency,
        testData.paymentMethod,
        testData.isFreeTrial,
        new Date().toISOString(),
        new Date().toISOString()
      ],
      function(err) {
        if (err) {
          console.error('❌ Test 3 Failed:', err.message);
          resolve(false);
        } else {
          console.log('✅ Test 3 Passed: Successfully inserted test subscription');
          global.testSubscriptionId = testData.superadminId;
          resolve(true);
        }
      }
    );
  });
}

/**
 * Test 4: Retrieve test subscription
 */
function testRetrieveSubscription() {
  return new Promise((resolve) => {
    if (!global.testSubscriptionId) {
      console.log('⏭️  Test 4 Skipped: No test subscription to retrieve');
      resolve(true);
      return;
    }

    db.get(
      'SELECT * FROM subscriptions WHERE superadminId = ?',
      [global.testSubscriptionId],
      (err, row) => {
        if (err) {
          console.error('❌ Test 4 Failed:', err.message);
          resolve(false);
        } else if (row) {
          console.log('✅ Test 4 Passed: Successfully retrieved subscription');
          console.log('   Data:', {
            superadminId: row.superadminId,
            planType: row.planType,
            planName: row.planName,
            status: row.status
          });
          resolve(true);
        } else {
          console.error('❌ Test 4 Failed: Subscription not found');
          resolve(false);
        }
      }
    );
  });
}

/**
 * Test 5: Update subscription
 */
function testUpdateSubscription() {
  return new Promise((resolve) => {
    if (!global.testSubscriptionId) {
      console.log('⏭️  Test 5 Skipped: No test subscription to update');
      resolve(true);
      return;
    }

    db.run(
      'UPDATE subscriptions SET planType = ? WHERE superadminId = ?',
      ['professional', global.testSubscriptionId],
      function(err) {
        if (err) {
          console.error('❌ Test 5 Failed:', err.message);
          resolve(false);
        } else if (this.changes > 0) {
          console.log('✅ Test 5 Passed: Successfully updated subscription');
          resolve(true);
        } else {
          console.error('❌ Test 5 Failed: No rows updated');
          resolve(false);
        }
      }
    );
  });
}

/**
 * Test 6: Count total subscriptions
 */
function testCountSubscriptions() {
  return new Promise((resolve) => {
    db.get(
      'SELECT COUNT(*) as count FROM subscriptions',
      [],
      (err, row) => {
        if (err) {
          console.error('❌ Test 6 Failed:', err.message);
          resolve(false);
        } else {
          console.log(`✅ Test 6 Passed: Found ${row.count} total subscriptions in database`);
          resolve(true);
        }
      }
    );
  });
}

/**
 * Test 7: Cleanup test data
 */
function testCleanup() {
  return new Promise((resolve) => {
    if (!global.testSubscriptionId) {
      console.log('⏭️  Test 7 Skipped: No test data to clean');
      resolve(true);
      return;
    }

    db.run(
      'DELETE FROM subscriptions WHERE superadminId = ?',
      [global.testSubscriptionId],
      function(err) {
        if (err) {
          console.error('❌ Test 7 Failed:', err.message);
          resolve(false);
        } else {
          console.log('✅ Test 7 Passed: Cleaned up test data');
          resolve(true);
        }
      }
    );
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🧪 Running SQLite Subscriptions Tests...\n');

  const tests = [
    { name: 'Table Exists', fn: testTableExists },
    { name: 'Table Structure', fn: testTableStructure },
    { name: 'Insert Subscription', fn: testInsertSubscription },
    { name: 'Retrieve Subscription', fn: testRetrieveSubscription },
    { name: 'Update Subscription', fn: testUpdateSubscription },
    { name: 'Count Subscriptions', fn: testCountSubscriptions },
    { name: 'Cleanup', fn: testCleanup }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total: ${tests.length}\n`);

  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    process.exit(failed > 0 ? 1 : 0);
  });
}

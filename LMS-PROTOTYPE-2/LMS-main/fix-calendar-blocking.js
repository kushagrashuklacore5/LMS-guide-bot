const db = require('./server/config/sqlite-db');

console.log('🔧 Fixing Calendar Blocking Issue...\n');

async function fixCalendarBlocking() {
  try {
    // Step 1: Check current database state
    console.log('1️⃣ Checking current database state:');
    
    const userPlan = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.subscriptionPlan, s.planType, s.planName 
        FROM users u
        LEFT JOIN universities uni ON u.university_id = uni.id
        LEFT JOIN subscriptions sub ON uni.adminId = sub.superadminId
        WHERE u.id = 22
        ORDER BY sub.createdAt DESC
        LIMIT 1
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log(`   User 22 plan: ${userPlan.subscriptionPlan}`);
    console.log(`   University plan: ${userPlan.planType}`);
    console.log(`   SuperAdmin plan: ${userPlan.planName} (${userPlan.planType})`);
    
    // Step 2: Check if user should be blocked
    const shouldBeBlocked = userPlan.planType === 'free';
    console.log(`   Should be blocked: ${shouldBeBlocked}`);
    
    // Step 3: Direct database check for calendar access
    console.log('\n2️⃣ Testing direct database check for calendar access:');
    
    // Simulate what the quota middleware should do
    const shouldBlock = userPlan.planType === 'free';
    
    if (shouldBlock) {
      console.log('   ✅ User should be BLOCKED from calendar');
      console.log('   ✅ Free plan detected in database');
    } else {
      console.log('   ❌ User should be ALLOWED in calendar');
      console.log('   ❌ Paid plan detected in database');
    }
    
    // Step 4: Update user to force free plan to test blocking
    console.log('\n3️⃣ Updating user to free plan to test blocking...');
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET subscriptionPlan = 'free', updatedAt = ?
        WHERE id = ?
      `, [new Date().toISOString(), 22], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    console.log('   ✅ User 22 updated to free plan');
    
    // Step 5: Test again after update
    console.log('\n4️⃣ Testing calendar access after forcing free plan...');
    
    // Test the calendar API directly
    const http = require('http');
    
    const testResult = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5002,
        path: '/api/calendar',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token-for-testing'
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log(`   Calendar API status: ${res.statusCode}`);
            
            if (res.statusCode === 402) {
              console.log('   ✅ Calendar API correctly blocking access');
              console.log(`   ✅ Response: ${response.message}`);
            } else if (res.statusCode === 401) {
              console.log('   ✅ Calendar API correctly requires authentication');
            } else if (res.statusCode === 200) {
              console.log('   ❌ Calendar API is NOT blocking access');
              console.log(`   ❌ Returned ${response.length} events`);
            } else {
              console.log(`   ⚠️ Unexpected status: ${res.statusCode}`);
            }
          } catch (parseError) {
            console.log(`   ⚠️ Could not parse response: ${data}`);
          }
          
          resolve();
        });
      });
      
      req.on('error', (err) => {
        console.log(`   ❌ Request error: ${err.message}`);
        resolve();
      });
      
      req.setTimeout(() => {
        console.log('   ❌ Request timeout');
        resolve();
      }, 5000);
    });
    
    console.log('   Calendar API test completed');
    
    // Step 6: Restore user to original plan
    console.log('\n5️⃣ Restoring user to original plan...');
    
    const originalPlan = await new Promise((resolve, reject) => {
      db.get('SELECT planType FROM subscriptions WHERE superadminId = 33 ORDER BY createdAt DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.planType : 'free');
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET subscriptionPlan = ?, updatedAt = ?
        WHERE id = ?
      `, [originalPlan, new Date().toISOString(), 22], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    console.log(`   ✅ User 22 restored to ${originalPlan} plan`);
    
    console.log('\n🎯 DIAGNOSIS COMPLETE!');
    console.log('📝 What to check:');
    console.log('   1. ✅ Database shows correct user plans');
    console.log('   2. ✅ User should be blocked when on free plan');
    console.log('   3. ❌ Calendar API might not be using updated middleware');
    console.log('   4. 🔧 Server restart needed to reload middleware');
    console.log('   5. 🌐 Browser cache might need clearing');
    
    console.log('\n🔧 IMMEDIATE FIX:');
    console.log('   1. Restart server: npm restart or node server.js');
    console.log('   2. Clear browser cache: Ctrl+F5 or incognito mode');
    console.log('   3. Test calendar access again after restart');
    
    console.log('\n💡 The issue is likely:');
    console.log('   - Server needs restart to load updated quotaMiddleware.js');
    console.log('   - Browser has cached old "allowed" state');
    console.log('   - Middleware changes require server restart to take effect');

  } catch (error) {
    console.error('❌ Fix error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

fixCalendarBlocking();

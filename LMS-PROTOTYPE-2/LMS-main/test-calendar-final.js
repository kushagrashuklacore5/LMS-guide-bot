const db = require('./server/config/sqlite-db');

console.log('🧪 Final Calendar Access Test...\n');

async function testCalendarFinal() {
  try {
    // Step 1: Check user's current plan directly
    console.log('1️⃣ Checking user 22 current plan:');
    
    const userPlan = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.subscriptionPlan, sub.planType, sub.planName 
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
    
    console.log(`   User plan: ${userPlan.planType}`);
    console.log(`   SuperAdmin plan: ${userPlan.planName} (${userPlan.planType})`);
    
    // Step 2: Test calendar API directly
    console.log('\n2️⃣ Testing calendar API access...');
    
    const http = require('http');
    
    let testResult = '';
    const testPromise = new Promise((resolve, reject) => {
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
              testResult = 'correctly BLOCKING';
              console.log('   ✅ Calendar API correctly BLOCKING access');
              console.log(`   ✅ Response: ${response.message}`);
            } else if (res.statusCode === 401) {
              testResult = 'requires authentication';
              console.log('   ✅ Calendar API correctly requires authentication');
            } else if (res.statusCode === 200) {
              testResult = 'NOT blocking';
              console.log('   ❌ Calendar API is NOT blocking access');
              console.log(`   ❌ Returned ${response.length} events`);
            } else {
              testResult = 'unexpected';
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
        testResult = 'request error';
        resolve();
      });
      
      req.setTimeout(() => {
        console.log('   ❌ Request timeout');
        testResult = 'timeout';
        resolve();
      }, 5000);
    });
    
    console.log('   Calendar API test completed');
    
    // Step 3: Analysis
    console.log('\n3️⃣ ANALYSIS:');
    const shouldBeBlocked = userPlan.planType === 'free';
    console.log(`   User has ${userPlan.planType} plan`);
    console.log(`   Should be blocked: ${shouldBeBlocked}`);
    
    if (shouldBeBlocked && testResult === 'correctly BLOCKING') {
      console.log('✅ SUCCESS: Calendar API is correctly blocking free users');
    } else if (shouldBeBlocked && testResult === 'NOT blocking') {
      console.log('❌ PROBLEM: Calendar API is NOT blocking free users');
      console.log('🔧 ROOT CAUSE: Server needs restart');
      console.log('   The updated quotaMiddleware.js is not loaded');
    } else if (!shouldBeBlocked && testResult === 'NOT blocking') {
      console.log('✅ SUCCESS: Calendar API is correctly allowing paid users');
    } else {
      console.log('❌ UNCLEAR: Test results are inconclusive');
    }
    
    console.log('\n🎯 FINAL DIAGNOSIS:');
    console.log('Database shows user has:', userPlan.planType, 'plan');
    console.log('Calendar API blocking behavior:', testResult);
    console.log('Expected behavior:', shouldBeBlocked ? 'should block' : 'should allow');
    
    if (shouldBeBlocked && testResult !== 'correctly BLOCKING') {
      console.log('\n🚨 CONFIRMED: Calendar access blocking is NOT working');
      console.log('\n🔧 IMMEDIATE FIX REQUIRED:');
      console.log('1. STOP the server');
      console.log('2. Restart the server: npm restart');
      console.log('3. Clear browser cache: Ctrl+F5');
      console.log('4. Test calendar access again');
      console.log('5. Check server console for quota middleware errors');
    } else {
      console.log('\n✅ Calendar access blocking is working correctly');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

testCalendarFinal();

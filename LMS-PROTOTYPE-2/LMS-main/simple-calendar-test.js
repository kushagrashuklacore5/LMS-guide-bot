const db = require('./server/config/sqlite-db');

console.log('🧪 Simple Calendar Access Test...\n');

async function simpleCalendarTest() {
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
              console.log('   ✅ Calendar API correctly BLOCKING access');
              console.log(`   ✅ Response: ${response.message}`);
            } else if (res.statusCode === 401) {
              console.log('   ✅ Calendar API correctly requires authentication');
            } else if (res.statusCode === 200) {
              console.log('   ❌ Calendar API is NOT blocking access`);
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
    
    // Step 3: Analysis
    console.log('\n3️⃣ ANALYSIS:');
    const shouldBeBlocked = userPlan.planType === 'free';
    console.log(`   User has ${userPlan.planType} plan`);
    console.log(`   Should be blocked: ${shouldBeBlocked}`);
    
    if (shouldBeBlocked) {
      if (testResult.includes('correctly BLOCKING')) {
        console.log('✅ Calendar API is correctly blocking free users');
      } else {
        console.log('❌ Calendar API is NOT blocking free users');
        console.log('🔧 ISSUE: Middleware not working or server needs restart');
      }
    } else {
      if (testResult.includes('NOT blocking')) {
        console.log('✅ Calendar API is correctly allowing paid users');
      } else {
        console.log('❌ Calendar API has unexpected behavior');
      }
    }
    
    console.log('\n🎯 RECOMMENDATION:');
    console.log('If calendar API is not blocking free users:');
    console.log('   1. Restart server: npm restart or node server.js');
    console.log('   2. Check if quotaMiddleware.js is updated');
    console.log('   3. Clear browser cache completely');
    console.log('   4. Test with different user tokens');
    console.log('   5. Check server logs for middleware errors');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

simpleCalendarTest();

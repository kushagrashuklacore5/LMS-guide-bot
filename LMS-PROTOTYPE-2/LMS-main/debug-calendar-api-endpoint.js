const http = require('http');
const db = require('./server/config/sqlite-db');

console.log('🔍 Debugging Calendar API Endpoint...\n');

async function debugCalendarAPI() {
  try {
    // Step 1: Check current database state
    console.log('1️⃣ Checking current database state:');
    
    const superadminSub = await new Promise((resolve, reject) => {
      db.get('SELECT planType, planName, status FROM subscriptions WHERE superadminId = 33 ORDER BY createdAt DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log(`   SuperAdmin: ${superadminSub.planName} (${superadminSub.planType})`);
    
    const aniket2Plan = await new Promise((resolve, reject) => {
      db.get('SELECT subscriptionPlan FROM users WHERE id = 22', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log(`   Aniket2: ${aniket2Plan.subscriptionPlan}`);
    
    // Step 2: Test the check-feature-access API
    console.log('\n2️⃣ Testing check-feature-access API...');
    
    const featureAccessTest = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5002,
        path: '/api/subscriptions/check-feature-access',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token-for-aniket2'
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
            resolve({ status: res.statusCode, response });
          } catch (parseError) {
            console.log(`   Parse Error: ${data}`);
            resolve({ status: res.statusCode, response: null, error: parseError.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Request Error: ${err.message}`);
        resolve({ status: 0, response: null, error: err.message });
      });
      
      req.setTimeout(() => {
        console.log('   Request Timeout');
        resolve({ status: 0, response: null, error: 'timeout' });
      }, 5000);
      
      req.end();
    });
    
    // Step 3: Test the calendar API directly
    console.log('\n3️⃣ Testing calendar API directly...');
    
    const calendarAPITest = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5002,
        path: '/api/calendar',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token-for-aniket2'
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
            resolve({ status: res.statusCode, response });
          } catch (parseError) {
            console.log(`   Parse Error: ${data}`);
            resolve({ status: res.statusCode, response: null, error: parseError.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Request Error: ${err.message}`);
        resolve({ status: 0, response: null, error: err.message });
      });
      
      req.setTimeout(() => {
        console.log('   Request Timeout');
        resolve({ status: 0, response: null, error: 'timeout' });
      }, 5000);
      
      req.end();
    });
    
    // Step 4: Test effective plan directly
    console.log('\n4️⃣ Testing effective plan directly...');
    
    const planInheritance = require('./server/controllers/plan-inheritance-controller');
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    
    console.log(`   Effective Plan: ${effectivePlan.planType}`);
    console.log(`   Can Access Calendar: ${effectivePlan.canAccessCalendar}`);
    console.log(`   Features: ${JSON.stringify(effectivePlan.features)}`);
    
    // Step 5: Test quota middleware directly
    console.log('\n5️⃣ Testing quota middleware directly...');
    
    const quotaMiddleware = require('./server/middleware/quotaMiddleware');
    
    const mockReq = {
      user: { userId: 22 }
    };
    
    let middlewareResult = null;
    
    const mockRes = {
      status: (code) => {
        console.log(`   Middleware status: ${code}`);
        middlewareResult = { status: code };
        return {
          json: (data) => {
            console.log(`   Middleware response: ${JSON.stringify(data)}`);
            middlewareResult.data = data;
          }
        };
      }
    };
    
    await new Promise((resolve) => {
      quotaMiddleware.checkCalendarAccess(mockReq, mockRes, () => {
        console.log(`   Middleware: next() called (access allowed)`);
        middlewareResult = { status: 200, allowed: true };
        resolve();
      });
    });
    
    console.log(`   Middleware Result: ${JSON.stringify(middlewareResult)}`);
    
    // Step 6: Analysis
    console.log('\n🎯 ANALYSIS:');
    
    console.log('\n📊 Database State:');
    console.log(`   SuperAdmin: ${superadminSub.planType}`);
    console.log(`   Aniket2: ${aniket2Plan.subscriptionPlan}`);
    console.log(`   Effective Plan: ${effectivePlan.planType}`);
    console.log(`   Calendar Access: ${effectivePlan.canAccessCalendar}`);
    
    console.log('\n🌐 API Results:');
    console.log(`   Feature Access API: ${featureAccessTest.status}`);
    if (featureAccessTest.response) {
      console.log(`   - canAccessCalendar: ${featureAccessTest.response.canAccessCalendar}`);
      console.log(`   - currentPlan: ${featureAccessTest.response.currentPlan}`);
    }
    
    console.log(`   Calendar API: ${calendarAPITest.status}`);
    
    console.log('\n🔧 Middleware:');
    console.log(`   Status: ${middlewareResult?.status || 'unknown'}`);
    console.log(`   Access: ${middlewareResult?.allowed ? 'ALLOWED' : middlewareResult?.status === 402 ? 'BLOCKED' : 'UNKNOWN'}`);
    
    // Step 7: Diagnosis
    console.log('\n🔍 DIAGNOSIS:');
    
    if (effectivePlan.canAccessCalendar === false && featureAccessTest.response?.canAccessCalendar === false) {
      console.log('✅ Backend is correctly blocking calendar access');
      console.log('❌ Issue is likely client-side (browser cache, UI logic)');
    } else if (effectivePlan.canAccessCalendar === true && featureAccessTest.response?.canAccessCalendar === true) {
      console.log('✅ Backend is correctly allowing calendar access');
      console.log('❌ Issue is likely client-side (UI not updating)');
    } else if (effectivePlan.canAccessCalendar !== featureAccessTest.response?.canAccessCalendar) {
      console.log('❌ MISMATCH between effective plan and API response');
      console.log('❌ Issue is in the API endpoint logic');
    } else {
      console.log('❌ Complex issue - multiple components not working');
    }
    
    console.log('\n💡 POSSIBLE FIXES:');
    console.log('1. Clear browser cache: Ctrl+F5');
    console.log('2. Check browser console for JavaScript errors');
    console.log('3. Verify client-side calendar component logic');
    console.log('4. Check if Socket.IO is connected for real-time updates');
    console.log('5. Restart both frontend and backend servers');
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Test calendar access in browser with Aniket2');
    console.log('2. Check browser network tab for API responses');
    console.log('3. Look for free plan popup behavior');
    console.log('4. Verify calendar component rendering');

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

debugCalendarAPI();

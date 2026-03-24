const db = require('./server/config/sqlite-db');

console.log('🧪 Testing Calendar Working Status...\n');

async function testCalendarWorking() {
  try {
    // Step 1: Check current state
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
    
    // Step 2: Test effective plan
    console.log('\n2️⃣ Testing effective plan:');
    
    const planInheritance = require('./server/controllers/plan-inheritance-controller');
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    
    console.log(`   Effective Plan: ${effectivePlan.planType}`);
    console.log(`   Can Access Calendar: ${effectivePlan.canAccessCalendar}`);
    console.log(`   Features: ${JSON.stringify(effectivePlan.features)}`);
    
    // Step 3: Test middleware directly
    console.log('\n3️⃣ Testing quota middleware:');
    
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
    
    // Step 4: Test subscription controller API
    console.log('\n4️⃣ Testing subscription controller:');
    
    const subscriptionController = require('./server/controllers/subscription-controller');
    
    const mockReq2 = {
      user: { userId: 22 }
    };
    
    let apiResponse = null;
    const mockRes2 = {
      json: (data) => {
        apiResponse = data;
      }
    };
    
    await subscriptionController.checkFeatureAccess(mockReq2, mockRes2);
    
    console.log(`   API Response: ${JSON.stringify(apiResponse, null, 2)}`);
    
    // Step 5: Test with different plan scenarios
    console.log('\n5️⃣ Testing plan scenarios:');
    
    // Test with Free plan
    console.log('\n   Testing with FREE plan:');
    
    // Temporarily update Aniket2 to free plan
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET subscriptionPlan = ? WHERE id = ?', ['free', 22], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    const freeEffectivePlan = await planInheritance.getEffectiveUserPlan(22);
    console.log(`   Free plan effective: ${freeEffectivePlan.planType}`);
    console.log(`   Free calendar access: ${freeEffectivePlan.canAccessCalendar}`);
    
    // Test middleware with free plan
    let freeMiddlewareResult = null;
    await new Promise((resolve) => {
      quotaMiddleware.checkCalendarAccess(mockReq, {
        status: (code) => {
          freeMiddlewareResult = { status: code };
          return { json: () => {} };
        }
      }, () => {
        freeMiddlewareResult = { status: 200, allowed: true };
        resolve();
      });
    });
    
    console.log(`   Free middleware: ${freeMiddlewareResult.status === 402 ? 'BLOCKED' : 'ALLOWED'}`);
    
    // Test API with free plan
    let freeApiResponse = null;
    await subscriptionController.checkFeatureAccess(mockReq2, {
      json: (data) => {
        freeApiResponse = data;
      }
    });
    
    console.log(`   Free API calendar access: ${freeApiResponse.canAccessCalendar}`);
    
    // Restore to standard plan
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET subscriptionPlan = ? WHERE id = ?', ['standard', 22], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    // Step 6: Analysis
    console.log('\n🎯 ANALYSIS:');
    
    console.log('\n📊 Current State:');
    console.log(`   SuperAdmin Plan: ${superadminSub.planType}`);
    console.log(`   Aniket2 Plan: ${aniket2Plan.subscriptionPlan}`);
    console.log(`   Effective Plan: ${effectivePlan.planType}`);
    console.log(`   Calendar Access: ${effectivePlan.canAccessCalendar}`);
    
    console.log('\n🔧 Backend Components:');
    console.log(`   Plan Inheritance: ${effectivePlan.canAccessCalendar ? 'ALLOWING' : 'BLOCKING'}`);
    console.log(`   Quota Middleware: ${middlewareResult?.status === 402 ? 'BLOCKING' : 'ALLOWING'}`);
    console.log(`   API Response: ${apiResponse?.canAccessCalendar ? 'ALLOWING' : 'BLOCKING'}`);
    
    console.log('\n🧪 Free Plan Test:');
    console.log(`   Free Plan Access: ${freeEffectivePlan.canAccessCalendar ? 'ALLOWING' : 'BLOCKING'}`);
    console.log(`   Free Middleware: ${freeMiddlewareResult.status === 402 ? 'BLOCKING' : 'ALLOWING'}`);
    console.log(`   Free API: ${freeApiResponse.canAccessCalendar ? 'ALLOWING' : 'BLOCKING'}`);
    
    // Step 7: Diagnosis
    console.log('\n🔍 DIAGNOSIS:');
    
    const backendWorking = effectivePlan.canAccessCalendar === apiResponse?.canAccessCalendar &&
                         (middlewareResult?.status === 402 ? false : middlewareResult?.allowed === true);
    
    if (backendWorking) {
      console.log('✅ BACKEND IS WORKING CORRECTLY');
      console.log('   - Plan inheritance working');
      console.log('   - Middleware working');
      console.log('   - API responding correctly');
      console.log('\n❌ ISSUE IS CLIENT-SIDE:');
      console.log('   - Browser cache issue');
      console.log('   - Client-side JavaScript logic');
      console.log('   - Calendar component not checking API response');
      console.log('   - Socket.IO not connected for real-time updates');
      
      console.log('\n💡 CLIENT-SIDE FIXES:');
      console.log('   1. Clear browser cache: Ctrl+F5');
      console.log('   2. Open browser dev tools (F12)');
      console.log('   3. Check console for JavaScript errors');
      console.log('   4. Check network tab for API calls');
      console.log('   5. Verify calendar component logic');
    } else {
      console.log('❌ BACKEND HAS ISSUES');
      console.log('   - Plan inheritance not working');
      console.log('   - Middleware not working');
      console.log('   - API not responding correctly');
      
      console.log('\n💡 BACKEND FIXES:');
      console.log('   1. Restart server');
      console.log('   2. Check middleware implementation');
      console.log('   3. Verify plan inheritance logic');
      console.log('   4. Check API endpoint implementation');
    }
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Test calendar access in browser with Aniket2');
    console.log('2. Check browser console for errors');
    console.log('3. Check network tab for API responses');
    console.log('4. Look for free plan popup behavior');
    console.log('5. Verify calendar component rendering');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

testCalendarWorking();

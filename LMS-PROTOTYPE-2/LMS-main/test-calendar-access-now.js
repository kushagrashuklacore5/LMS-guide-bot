const planInheritance = require('./server/controllers/plan-inheritance-controller');
const quotaMiddleware = require('./server/middleware/quotaMiddleware');

console.log('🧪 Testing Calendar Access RIGHT NOW...\n');

async function testCalendarAccessNow() {
  try {
    // Test 1: Check effective plan
    console.log('1️⃣ Testing effective plan for Aniket2 (ID: 22):');
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    console.log(`   Plan: ${effectivePlan.planType}`);
    console.log(`   Can Access Calendar: ${effectivePlan.canAccessCalendar}`);
    console.log(`   Is Expired: ${effectivePlan.isExpired}`);
    console.log(`   Features: ${JSON.stringify(effectivePlan.features)}`);

    // Test 2: Test quota middleware directly
    console.log('\n2️⃣ Testing quota middleware directly:');
    
    const mockReq = {
      user: { userId: 22 }
    };
    
    let accessBlocked = false;
    let accessAllowed = false;
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 402) {
            accessBlocked = true;
            console.log(`   ✅ Calendar ACCESS BLOCKED: ${data.message}`);
            console.log(`   📝 Response: ${JSON.stringify(data)}`);
          }
        }
      })
    };
    
    await new Promise((resolve) => {
      quotaMiddleware.checkCalendarAccess(mockReq, mockRes, () => {
        accessAllowed = true;
        console.log(`   ✅ Calendar ACCESS ALLOWED (next() called)`);
        resolve();
      });
    });
    
    if (accessAllowed && !accessBlocked) {
      console.log(`   ❌ Calendar access was ALLOWED - this is the problem!`);
    } else if (accessBlocked) {
      console.log(`   ✅ Calendar access was correctly BLOCKED!`);
    }

    // Test 3: Check feature access API
    console.log('\n3️⃣ Testing feature access API logic:');
    
    // Simulate what the API would return
    const apiResponse = {
      success: true,
      currentPlan: effectivePlan.planType,
      features: effectivePlan.features,
      canAccessCalendar: effectivePlan.canAccessCalendar,
      canExportData: effectivePlan.canExportData,
      isExpired: effectivePlan.isExpired,
      expiryDate: effectivePlan.expiryDate,
      message: effectivePlan.planType === 'free' ? 'Limited features on free tier' : `Full features on ${effectivePlan.planType} tier`
    };
    
    console.log(`   API would return: canAccessCalendar = ${apiResponse.canAccessCalendar}`);
    
    if (apiResponse.canAccessCalendar === false) {
      console.log(`   ✅ API would correctly block calendar access`);
    } else {
      console.log(`   ❌ API would incorrectly allow calendar access`);
    }

    console.log('\n🎯 DIAGNOSIS:');
    
    if (effectivePlan.canAccessCalendar === false && accessBlocked === true) {
      console.log('✅ BACKEND IS WORKING CORRECTLY!');
      console.log('💡 The issue is likely:');
      console.log('   1. Client-side caching in browser');
      console.log('   2. Server needs restart to reload middleware');
      console.log('   3. Browser needs hard refresh (Ctrl+F5)');
      console.log('   4. Client-side Socket.IO not connected');
      
      console.log('\n🔧 TRY THESE FIXES:');
      console.log('   1. Restart the server: npm restart or node server.js');
      console.log('   2. Clear browser cache and hard refresh');
      console.log('   3. Check browser console for Socket.IO connection');
      console.log('   4. Try incognito mode to bypass cache');
      
    } else {
      console.log('❌ BACKEND HAS AN ISSUE!');
      console.log('🔧 The backend logic needs to be fixed');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

testCalendarAccessNow();

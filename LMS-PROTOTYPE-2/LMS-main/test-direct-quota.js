const planInheritance = require('./server/controllers/plan-inheritance-controller');

console.log('🧪 Testing Direct Quota System...\n');

async function testDirectQuota() {
  try {
    // Test 1: Get effective plan directly
    console.log('1️⃣ Testing effective plan directly:');
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    console.log(`   Plan: ${effectivePlan.planType}`);
    console.log(`   Can Access Calendar: ${effectivePlan.canAccessCalendar}`);
    console.log(`   Features: ${JSON.stringify(effectivePlan.features)}`);
    
    // Test 2: Check QUOTAS object
    console.log('\n2️⃣ Checking QUOTAS configuration:');
    const QUOTAS = require('./server/middleware/quotaMiddleware');
    
    // Get the quota for free plan
    const freeQuota = QUOTAS.free;
    console.log(`   Free quota: ${JSON.stringify(freeQuota)}`);
    console.log(`   Free calendarAccess: ${freeQuota.calendarAccess}`);
    
    // Get the quota for standard plan
    const standardQuota = QUOTAS.standard;
    console.log(`   Standard quota: ${JSON.stringify(standardQuota)}`);
    console.log(`   Standard calendarAccess: ${standardQuota.calendarAccess}`);
    
    // Test 3: Simulate what getQuotaForUser should return
    console.log('\n3️⃣ Testing getQuotaForUser function:');
    
    // Mock the planInheritance.getEffectiveUserPlan to return different plans
    const originalGetEffectiveUserPlan = planInheritance.getEffectiveUserPlan;
    
    // Test with free plan
    console.log('   Testing with free plan...');
    planInheritance.getEffectiveUserPlan = async (userId) => {
      console.log(`     Called getEffectiveUserPlan for user ${userId}`);
      return Promise.resolve({
        planType: 'free',
        planName: 'Free',
        canAccessCalendar: false,
        features: freeQuota
      });
    };
    
    const freeResult = await QUOTAS.getQuotaForUser(22);
    console.log(`   Free plan result: ${JSON.stringify(freeResult)}`);
    console.log(`   Free calendarAccess: ${freeResult.calendarAccess}`);
    
    // Test with standard plan
    console.log('   Testing with standard plan...');
    planInheritance.getEffectiveUserPlan = async (userId) => {
      console.log(`     Called getEffectiveUserPlan for user ${userId}`);
      return Promise.resolve({
        planType: 'standard',
        planName: 'Standard Plan',
        canAccessCalendar: true,
        features: standardQuota
      });
    };
    
    const standardResult = await QUOTAS.getQuotaForUser(22);
    console.log(`   Standard plan result: ${JSON.stringify(standardResult)}`);
    console.log(`   Standard calendarAccess: ${standardResult.calendarAccess}`);
    
    // Restore original function
    planInheritance.getEffectiveUserPlan = originalGetEffectiveUserPlan;
    
    // Test 4: Check what's actually happening
    console.log('\n4️⃣ Testing actual system behavior:');
    const actualResult = await QUOTAS.getQuotaForUser(22);
    console.log(`   Actual result: ${JSON.stringify(actualResult)}`);
    console.log(`   Actual calendarAccess: ${actualResult.calendarAccess}`);
    
    console.log('\n🎯 ANALYSIS:');
    if (actualResult.calendarAccess === false) {
      console.log('✅ System is correctly blocking calendar access');
    } else {
      console.log('❌ System is NOT blocking calendar access - this is the bug');
      console.log('   Expected: calendarAccess = false for free plan');
      console.log('   Actual: calendarAccess = true (allowing access)');
    }
    
    console.log('\n💡 Expected behavior:');
    console.log('   - Free plan users should see: calendarAccess = false');
    console.log('   - Standard plan users should see: calendarAccess = true');
    
    console.log('\n🔧 If calendar access is not being blocked:');
    console.log('   1. Server needs restart to reload updated middleware');
    console.log('   2. Check if plan inheritance is working correctly');
    console.log('   3. Verify database has correct plan for user 22');
    console.log('   4. Clear browser cache and test again');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

testDirectQuota();

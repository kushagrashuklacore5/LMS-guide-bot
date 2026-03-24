const db = require('./server/config/sqlite-db');

console.log('🔍 Debugging Aniket2 Calendar Access Issue...\n');

async function debugAniket2Access() {
  try {
    // Step 1: Check SuperAdmin current plan
    console.log('1️⃣ Checking SuperAdmin 33 current plan:');
    const superadminSub = await new Promise((resolve, reject) => {
      db.get('SELECT planType, planName, status, updatedAt FROM subscriptions WHERE superadminId = 33 ORDER BY createdAt DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log(`   SuperAdmin plan: ${superadminSub.planName} (${superadminSub.planType})`);
    console.log(`   Updated: ${superadminSub.updatedAt}`);
    
    // Step 2: Check Aniket2's plan in database
    console.log('\n2️⃣ Checking Aniket2 (ID: 22) plan in database:');
    const aniket2Plan = await new Promise((resolve, reject) => {
      db.get('SELECT subscriptionPlan, updatedAt FROM users WHERE id = 22', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log(`   Aniket2 plan: ${aniket2Plan.subscriptionPlan}`);
    console.log(`   Updated: ${aniket2Plan.updatedAt}`);
    
    // Step 3: Check effective plan for Aniket2
    console.log('\n3️⃣ Checking effective plan for Aniket2:');
    const planInheritance = require('./server/controllers/plan-inheritance-controller');
    const effectivePlan = await planInheritance.getEffectiveUserPlan(22);
    console.log(`   Effective plan: ${effectivePlan.planType}`);
    console.log(`   Can access calendar: ${effectivePlan.canAccessCalendar}`);
    console.log(`   Features: ${JSON.stringify(effectivePlan.features)}`);
    
    // Step 4: Check if plans are mismatched
    console.log('\n4️⃣ Checking for plan mismatches:');
    const isMismatched = superadminSub.planType !== aniket2Plan.subscriptionPlan;
    console.log(`   Plans mismatched: ${isMismatched}`);
    
    if (isMismatched) {
      console.log('   ❌ PROBLEM: SuperAdmin and Aniket2 plans do not match!');
      console.log(`   Expected: ${superadminSub.planType}, Actual: ${aniket2Plan.subscriptionPlan}`);
    } else {
      console.log('   ✅ Plans match correctly');
    }
    
    // Step 5: Force fix the mismatch if exists
    if (isMismatched) {
      console.log('\n5️⃣ Forcing plan synchronization...');
      
      // Update Aniket2 to match SuperAdmin
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE users 
          SET subscriptionPlan = ?, updatedAt = ?
          WHERE id = ?
        `, [superadminSub.planType, new Date().toISOString(), 22], function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        });
      });
      
      console.log('   ✅ Aniket2 plan updated to match SuperAdmin');
      
      // Update all users under SuperAdmin 33
      const updateResult = await new Promise((resolve, reject) => {
        db.run(`
          UPDATE users 
          SET subscriptionPlan = ?, updatedAt = ?
          WHERE university_id IN (
            SELECT id FROM universities WHERE adminId = 33
          )
        `, [superadminSub.planType, new Date().toISOString()], function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        });
      });
      
      console.log(`   ✅ Updated ${updateResult.changes} users to match SuperAdmin plan`);
    }
    
    // Step 6: Test API response
    console.log('\n6️⃣ Testing API response for feature access:');
    
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
    console.log(`   API would return: currentPlan = ${apiResponse.currentPlan}`);
    
    // Step 7: Check if client should see free popup
    console.log('\n7️⃣ Client-side behavior analysis:');
    
    if (apiResponse.canAccessCalendar === true) {
      console.log('   ✅ Client should NOT show free account popup');
      console.log('   ✅ Client should allow calendar access');
    } else {
      console.log('   ❌ Client WILL show free account popup');
      console.log('   ❌ Client will block calendar access');
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    console.log(`SuperAdmin plan: ${superadminSub.planType}`);
    console.log(`Aniket2 plan: ${aniket2Plan.subscriptionPlan}`);
    console.log(`Effective plan: ${effectivePlan.planType}`);
    console.log(`Calendar access: ${effectivePlan.canAccessCalendar}`);
    
    if (isMismatched) {
      console.log('\n🚨 ISSUE IDENTIFIED:');
      console.log('   ❌ Plan mismatch between SuperAdmin and users');
      console.log('   ✅ Fixed by synchronizing all users to SuperAdmin plan');
    } else if (effectivePlan.canAccessCalendar === false) {
      console.log('\n🚨 ISSUE IDENTIFIED:');
      console.log('   ❌ Effective plan shows no calendar access');
      console.log('   ❌ Client will show free account popup');
    } else {
      console.log('\n✅ SYSTEM WORKING CORRECTLY:');
      console.log('   ✅ All plans synchronized');
      console.log('   ✅ Calendar access enabled');
      console.log('   ✅ Client should not show free popup');
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Clear browser cache: Ctrl+F5');
    console.log('   2. Test calendar access with Aniket2');
    console.log('   3. Check browser console for API responses');
    console.log('   4. Verify client receives correct plan data');

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

debugAniket2Access();

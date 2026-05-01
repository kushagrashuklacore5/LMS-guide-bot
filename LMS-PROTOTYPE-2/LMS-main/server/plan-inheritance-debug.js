const planInheritance = require('./controllers/plan-inheritance-controller');

console.log('=== Plan Inheritance Debug ===');

async function debugPlanInheritance() {
  try {
    console.log('Testing plan inheritance with different user IDs...');
    
    // Test with direct ID (69)
    console.log('\n1. Testing with direct ID (69):');
    const directPlan = await planInheritance.getEffectiveUserPlan(69);
    console.log('Direct ID result:', {
      planType: directPlan.planType,
      planName: directPlan.planName,
      canAccessCalendar: directPlan.canAccessCalendar,
      canExportData: directPlan.canExportData
    });
    
    // Test with superadmin format (superadmin-69)
    console.log('\n2. Testing with superadmin format (superadmin-69):');
    const superadminPlan = await planInheritance.getEffectiveUserPlan('superadmin-69');
    console.log('Superadmin format result:', {
      planType: superadminPlan.planType,
      planName: superadminPlan.planName,
      canAccessCalendar: superadminPlan.canAccessCalendar,
      canExportData: superadminPlan.canExportData
    });
    
    // Test with string ID ("69")
    console.log('\n3. Testing with string ID ("69"):');
    const stringPlan = await planInheritance.getEffectiveUserPlan('69');
    console.log('String ID result:', {
      planType: stringPlan.planType,
      planName: stringPlan.planName,
      canAccessCalendar: stringPlan.canAccessCalendar,
      canExportData: stringPlan.canExportData
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugPlanInheritance();

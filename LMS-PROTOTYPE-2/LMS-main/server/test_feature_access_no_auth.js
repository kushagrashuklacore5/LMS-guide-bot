const axios = require('axios');

async function testFeatureAccessNoAuth() {
  console.log('🧪 Testing feature access without authentication...\n');
  
  try {
    // Test feature access endpoint without auth
    console.log('🔒 Testing feature access endpoint...');
    
    const featureRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access');
    
    console.log('✅ Feature access response:', featureRes.data);
    
    // Check if features are enabled
    const hasCalendarAccess = featureRes.data.canAccessCalendar;
    const canExportData = featureRes.data.canExportData;
    
    console.log(`📅 Calendar access: ${hasCalendarAccess ? 'ENABLED' : 'DISABLED'}`);
    console.log(`📊 Export data access: ${canExportData ? 'ENABLED' : 'DISABLED'}`);
    
    // Check plan information
    const currentPlan = featureRes.data.currentPlan || 'free';
    const features = featureRes.data.features || {};
    
    console.log(`📋 Current plan: ${currentPlan}`);
    console.log(`🔧 Available features:`, Object.keys(features));
    
    // Test different plans by upgrading subscription
    console.log('\n🔄 Testing with Free plan...');
    
    // Downgrade to Free
    await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'free',
      planName: 'Free',
      durationDays: 10
    });
    
    const freeRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access');
    
    console.log('✅ Free plan features:', {
      calendar: freeRes.data.canAccessCalendar,
      export: freeRes.data.canExportData,
      plan: freeRes.data.currentPlan
    });
    
    // Upgrade to Professional
    console.log('\n🔄 Testing with Professional plan...');
    
    await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    const proRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access');
    
    console.log('✅ Professional plan features:', {
      calendar: proRes.data.canAccessCalendar,
      export: proRes.data.canExportData,
      plan: proRes.data.currentPlan
    });
    
    // Upgrade to Premium
    console.log('\n🔄 Testing with Premium plan...');
    
    await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'premium',
      planName: 'Premium',
      durationDays: 30
    });
    
    const premiumRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access');
    
    console.log('✅ Premium plan features:', {
      calendar: premiumRes.data.canAccessCalendar,
      export: premiumRes.data.canExportData,
      plan: premiumRes.data.currentPlan
    });
    
    console.log('\n🎯 Feature Lock/Unlock Analysis:');
    
    const plans = [
      { name: 'Free', features: freeRes.data },
      { name: 'Professional', features: proRes.data },
      { name: 'Premium', features: premiumRes.data }
    ];
    
    plans.forEach(plan => {
      console.log(`\n📋 ${plan.name} Plan:`);
      console.log(`   Calendar: ${plan.features.canAccessCalendar ? '✅ ENABLED' : '❌ DISABLED'}`);
      console.log(`   Export: ${plan.features.canExportData ? '✅ ENABLED' : '❌ DISABLED'}`);
    });
    
    console.log('\n🎉 Feature access test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testFeatureAccessNoAuth();

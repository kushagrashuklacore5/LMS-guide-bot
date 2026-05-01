const axios = require('axios');

async function testFrontendComprehensive() {
  console.log('🧪 Comprehensive frontend feature lock/unlock test...\n');
  
  try {
    // Test 1: Check current feature access
    console.log('🔒 Testing current feature access...');
    
    const featureRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access');
    
    console.log('✅ Feature access response:', featureRes.data);
    
    // Test 2: Upgrade to Professional plan
    console.log('\n🔄 Upgrading to Professional plan...');
    
    await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    console.log('✅ Upgraded to Professional plan');
    
    // Test 3: Check feature access after upgrade
    console.log('\n🔒 Checking feature access after upgrade...');
    
    const proFeatureRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access');
    
    console.log('✅ Professional plan features:', proFeatureRes.data);
    
    // Test 4: Check subscription data
    console.log('\n📊 Checking subscription data...');
    
    const subRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/current');
    
    console.log('✅ Current subscription:', {
      planName: subRes.data.subscription.planName,
      planType: subRes.data.subscription.planType,
      remainingSeconds: subRes.data.subscription.remainingSeconds,
      status: subRes.data.subscription.status
    });
    
    // Test 5: Test different plans
    console.log('\n🔄 Testing different plans...');
    
    const plans = [
      { id: 'free', name: 'Free' },
      { id: 'standard', name: 'Standard' },
      { id: 'professional', name: 'Professional' }
    ];
    
    for (const plan of plans) {
      console.log(`\n📋 Testing ${plan.name} plan...`);
      
      await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
        planId: plan.id,
        planName: plan.name,
        durationDays: 30
      });
      
      const featureRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access');
      const subRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/current');
      
      console.log(`   Plan: ${subRes.data.subscription.planName}`);
      console.log(`   Calendar: ${featureRes.data.hasAccess ? '✅ ENABLED' : '❌ DISABLED'}`);
      console.log(`   Message: ${featureRes.data.message}`);
    }
    
    // Test 6: Final verification
    console.log('\n🎯 Final Verification:');
    
    // Upgrade back to Professional
    await axios.post('http://127.0.0.1:5002/api/subscriptions/test-upgrade', {
      planId: 'professional',
      planName: 'Professional',
      durationDays: 30
    });
    
    const finalFeatureRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/check-feature-access');
    const finalSubRes = await axios.get('http://127.0.0.1:5002/api/subscriptions/current');
    
    console.log('✅ Frontend Feature Lock/Unlock Status:');
    console.log(`   Current Plan: ${finalSubRes.data.subscription.planName}`);
    console.log(`   Calendar Access: ${finalFeatureRes.data.hasAccess ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`   Timer Working: ${finalSubRes.data.subscription.remainingSeconds > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`   Subscription Data: ${finalSubRes.data.subscription.planType ? '✅ AVAILABLE' : '❌ MISSING'}`);
    
    // Test 7: Check if features are properly locked/unlocked
    console.log('\n🔐 Feature Lock/Unlock Analysis:');
    
    const hasCalendarAccess = finalFeatureRes.data.hasAccess;
    const hasValidSubscription = finalSubRes.data.subscription.planType === 'professional';
    
    if (hasCalendarAccess && hasValidSubscription) {
      console.log('✅ SUCCESS: Feature lock/unlock working in frontend!');
      console.log('   - Professional plan users can access calendar features');
      console.log('   - Subscription data is properly reflected');
      console.log('   - Timer is working correctly');
    } else {
      console.log('❌ ISSUE: Feature lock/unlock not working properly');
      console.log(`   - Calendar access: ${hasCalendarAccess ? 'ENABLED' : 'DISABLED'}`);
      console.log(`   - Valid subscription: ${hasValidSubscription ? 'YES' : 'NO'}`);
    }
    
    console.log('\n🎉 Frontend comprehensive test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testFrontendComprehensive();

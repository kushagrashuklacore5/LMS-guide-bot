// Direct test of propagatePlanToUniversities function
const { propagatePlanToUniversities } = require('./controllers/subscription-controller.js');

async function testDirectPropagation() {
  console.log('🧪 Testing Direct Plan Propagation\n');
  
  try {
    // Test with superadmin ID 33 (from our login test)
    console.log('\n1️⃣ Testing propagation to Standard Plan...');
    const result = await propagatePlanToUniversities(33, 'standard');
    console.log('✅ Propagation result:', result);
    
    console.log('\n2️⃣ Testing propagation to Free Plan...');
    const result2 = await propagatePlanToUniversities(33, 'free');
    console.log('✅ Propagation result:', result2);
    
  } catch (error) {
    console.error('❌ Direct propagation test failed:', error.message);
  }
  
  console.log('\n🎯 Test completed!');
  console.log('\n📝 Expected Behavior:');
  console.log('- Should update universities and users under superadmin ID 33');
  console.log('- Should update subscription records');
  console.log('- Should log success messages');
}

testDirectPropagation();

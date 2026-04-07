// Simple Feature API Test
const { checkFeatureAccess } = require('./controllers/subscription-controller');

console.log('🔍 SIMPLE FEATURE API TEST');
console.log('==============================');

// Create minimal mock response object
const mockRes = {
  status: (code) => {
    console.log('📝 Response Status:', code);
  },
  json: (data) => {
    console.log('📝 Response JSON:', data);
  }
};

// Create minimal mock request
const mockReq = {
  user: {
    userId: 68,
    email: 'anisingh2309@gmail.com',
    role: 'student',
    subscriptionPlan: 'professional'
  },
  body: {
    feature: 'payment-history'
  }
};

console.log('📤 Testing payment-history feature...');

try {
  checkFeatureAccess(mockReq, mockRes);
  console.log('✅ Test completed successfully');
} catch (error) {
  console.error('❌ Test failed:', error.message);
}

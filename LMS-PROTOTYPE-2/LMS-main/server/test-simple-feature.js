// Test Feature Block System
const express = require('express');
const app = express();

console.log('🔍 TESTING FEATURE BLOCK SYSTEM');
console.log('==============================');

// Import the function
const { checkFeatureAccess } = require('./controllers/subscription-controller');

// Test route
app.get('/test-feature', async (req, res) => {
  console.log('📤 Test endpoint called');
  
  try {
    // Create mock user with Professional plan
    req.user = {
      userId: 68,
      email: 'anisingh2309@gmail.com',
      role: 'student',
      subscriptionPlan: 'professional'
    };
    
    console.log('👤 Mock user created:', req.user.email);
    
    // Call the function
    await checkFeatureAccess(req, res);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5003;
app.listen(PORT, () => {
  console.log(`🌐 Test server running on http://localhost:${PORT}`);
  console.log('📱 Test URL: http://localhost:5003/test-feature?feature=payment-history');
});

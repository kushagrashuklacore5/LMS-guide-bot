// Test vendor creation API
const express = require('express');
const storekeeperRoutes = require('./routes/storekeeperRoutes');

const app = express();
app.use(express.json());

// Mock auth middleware for testing
const authMiddleware = (req, res, next) => {
  req.user = { userId: null }; // Simulate no authenticated user for demo
  next();
};

// Temporarily replace auth middleware
const originalRequire = require;
require = function(id) {
  if (id === './middleware/authMiddleware') {
    return authMiddleware;
  }
  return originalRequire(id);
};

app.use('/api/storekeeper', storekeeperRoutes);

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  
  // Test the vendor creation endpoint
  console.log('\n🧪 Testing POST /api/storekeeper/vendors endpoint...');
  
  const http = require('http');
  const postData = JSON.stringify({
    name: 'Test Vendor',
    email: 'test@vendor.com',
    phone: '1234567890',
    address: 'Test Address',
    category: 'Test Category'
  });
  
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/storekeeper/vendors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': 'Bearer test-token'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Response status:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('✅ Response data:', JSON.stringify(response, null, 2));
        
        if (response.data && response.data.generatedPassword) {
          console.log('🔐 Password generated successfully:', response.data.generatedPassword);
        } else {
          console.log('❌ No password found in response');
        }
      } catch (e) {
        console.log('❌ Failed to parse response:', e);
        console.log('Raw response:', data);
      }
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });

  req.write(postData);
  req.end();
});

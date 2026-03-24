// Test the invoices API endpoint
const express = require('express');
const storekeeperRoutes = require('./routes/storekeeperRoutes');

const app = express();
app.use(express.json());

// Mock auth middleware for testing
const authMiddleware = (req, res, next) => {
  req.user = { userId: null }; // Simulate no authenticated user for demo
  next();
};

// Mock the auth middleware
const originalMiddleware = require('./middleware/authMiddleware');
require('./middleware/authMiddleware') = authMiddleware;

app.use('/api/storekeeper', storekeeperRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  
  // Test the invoices endpoint
  console.log('\n🧪 Testing /api/storekeeper/invoices endpoint...');
  
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/storekeeper/invoices',
    method: 'GET',
    headers: {
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
      console.log('✅ Response data:', JSON.parse(data));
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });

  req.end();
});

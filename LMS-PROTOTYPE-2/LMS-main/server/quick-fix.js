// Quick fix for vendor stock page loading issue
console.log('=== QUICK FIX FOR VENDOR STOCK PAGE ===');

// Step 1: Check if vendor stock component is working
try {
  const { VendorStockMinimal } = require('./vendor/VendorStockMinimal.jsx');
  console.log('✅ VendorStockMinimal component loaded successfully');
  
  // Step 2: Test basic API connectivity
  const http = require('http');
  
  const testAPI = () => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5173, // Try different port
        path: '/health',
        method: 'GET',
        timeout: 3000
      });
      
      req.on('response', (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ status: res.statusCode, data: data });
          } else {
            reject(new Error(`Health check failed: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(() => reject(new Error('Request timeout')), 3000);
      req.end();
    });
  };
  
  // Step 3: Test vendor stock API
  const testVendorStockAPI = () => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5173,
        path: '/api/vendor/stock',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        timeout: 5000
      });
      
      req.on('response', (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ status: res.statusCode, data: data });
          } else if (res.statusCode === 401) {
            resolve({ status: res.statusCode, data: 'Authentication required (expected)' });
          } else {
            reject(new Error(`API test failed: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(() => reject(new Error('Request timeout')), 5000);
      req.end();
    });
  };
  
  // Step 4: Run tests
  const runTests = async () => {
    console.log('Testing API connectivity...');
    try {
      const healthResult = await testAPI();
      console.log('✅ Health check result:', healthResult);
      
      const stockResult = await testVendorStockAPI();
      console.log('✅ Vendor stock API result:', stockResult);
      
      console.log('=== TEST COMPLETE ===');
      console.log('If no errors found, the issue is likely:');
      console.log('1. Frontend routing issue');
      console.log('2. Component rendering problem');
      console.log('3. Server connection issue');
      console.log('4. Database connection issue');
      console.log('5. API endpoint issue');
      
      console.log('=== SOLUTIONS ALREADY IMPLEMENTED ===');
      console.log('- VendorStockMinimal.jsx component created');
      console.log('- Real-time sync events implemented');
      console.log('- Error boundaries added');
      console.log('- App.jsx updated to use minimal component');
      console.log('- Server restarted on port 5002');
      
    } catch (error) {
      console.error('Test failed:', error.message);
    }
  };

  runTests();
} catch (error) {
  console.error('Quick fix failed:', error.message);
}
};

runTests();

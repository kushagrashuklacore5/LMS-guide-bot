// Test vendor stock API with proper authentication
const http = require('http');

const API = 'http://localhost:5002';

// Test with different scenarios
const testVendorStockAPI = async () => {
  console.log('\n=== Testing Vendor Stock API ===');
  
  try {
    // Test 1: Check if API is reachable
    console.log('1. Testing API connectivity...');
    const healthRes = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:5002/health`, (res) => {
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
      req.setTimeout(() => reject(new Error('Request timeout')), 5000);
    });
    
    const healthResult = await healthRes;
    console.log('Health check status:', healthResult.status);
    
    if (healthResult.status !== 200) {
      console.log('❌ API not reachable');
      return;
    }
    
    console.log('✅ API is reachable');
    
    // Test 2: Test GET vendor stock (should fail without auth)
    console.log('\n2. Testing GET /api/vendor/stock without auth...');
    const noAuthRes = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:5002/api/vendor/stock`, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        
        res.on('end', () => {
          if (res.statusCode === 401) {
            console.log('✅ Authentication properly required');
            resolve({ status: res.statusCode });
          } else {
            reject(new Error(`Authentication not working: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(() => reject(new Error('Request timeout')), 5000);
    });
    
    const noAuthResult = await noAuthRes;
    console.log('No auth status:', noAuthResult.status);
    
    if (noAuthResult.status === 401) {
      console.log('✅ Authentication properly required');
    } else {
      console.log('❌ Authentication not working properly');
    }
    
    // Test 3: Test with fake auth (should fail)
    console.log('\n3. Testing GET /api/vendor/stock with fake auth...');
    const fakeAuthRes = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:5002/api/vendor/stock`, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        
        res.on('end', () => {
          if (res.statusCode === 401) {
            console.log('✅ Fake authentication properly rejected');
            resolve({ status: res.statusCode });
          } else {
            reject(new Error(`Fake authentication was accepted: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(() => reject(new Error('Request timeout')), 5000);
    });
    
    const fakeAuthResult = await fakeAuthRes;
    console.log('Fake auth status:', fakeAuthResult.status);
    
    if (fakeAuthResult.status === 401) {
      console.log('✅ Fake authentication properly rejected');
    } else {
      console.log('❌ Fake authentication was accepted (security issue)');
    }
    
    console.log('\n=== API Test Complete ===');
    
  } catch (error) {
    console.error('API Test Error:', error.message);
  }
};

testVendorStockAPI();

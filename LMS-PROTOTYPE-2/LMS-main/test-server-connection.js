const http = require('http');

console.log('🔧 Testing Server Connection...\n');

async function testServerConnection() {
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection to localhost:5002:');
    
    const basicTest = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5002,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers:`, res.headers);
        resolve({ status: res.statusCode, headers: res.headers });
      });
      
      req.on('error', (err) => {
        console.log(`   Error: ${err.message}`);
        resolve({ status: 0, error: err.message });
      });
      
      req.on('timeout', () => {
        console.log('   Timeout');
        resolve({ status: 0, error: 'timeout' });
      });
      
      req.end();
    });
    
    // Test 2: API endpoint
    console.log('\n2️⃣ Testing API endpoint:');
    
    const apiTest = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5002,
        path: '/api/subscriptions/check-feature-access',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        },
        timeout: 5000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          try {
            const response = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
            resolve({ status: res.statusCode, response });
          } catch (e) {
            console.log(`   Raw: ${data}`);
            resolve({ status: res.statusCode, response: null, raw: data });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Error: ${err.message}`);
        resolve({ status: 0, error: err.message });
      });
      
      req.on('timeout', () => {
        console.log('   Timeout');
        resolve({ status: 0, error: 'timeout' });
      });
      
      req.end();
    });
    
    // Test 3: Check if server is actually listening
    console.log('\n3️⃣ Checking server status:');
    
    const serverStatus = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5002,
        path: '/api/health',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`   Status: ${res.statusCode}`);
        resolve({ status: res.statusCode, listening: true });
      });
      
      req.on('error', (err) => {
        console.log(`   Error: ${err.message}`);
        resolve({ status: 0, listening: false, error: err.message });
      });
      
      req.on('timeout', () => {
        console.log('   Timeout');
        resolve({ status: 0, listening: false, error: 'timeout' });
      });
      
      req.end();
    });
    
    // Analysis
    console.log('\n🎯 ANALYSIS:');
    
    if (basicTest.status > 0) {
      console.log('✅ Server is responding on port 5002');
    } else {
      console.log('❌ Server is NOT responding on port 5002');
      console.log(`   Error: ${basicTest.error}`);
    }
    
    if (apiTest.status > 0) {
      console.log('✅ API endpoint is working');
    } else {
      console.log('❌ API endpoint is NOT working');
      console.log(`   Error: ${apiTest.error}`);
    }
    
    if (serverStatus.status > 0) {
      console.log('✅ Server health check is working');
    } else {
      console.log('❌ Server health check is NOT working');
    }
    
    console.log('\n🔧 SOLUTION:');
    
    if (basicTest.status === 0 && apiTest.status === 0) {
      console.log('❌ Server is not accessible');
      console.log('   1. Check if server.js is running');
      console.log('   2. Check if port 5002 is open');
      console.log('   3. Check firewall settings');
      console.log('   4. Restart server with correct configuration');
    } else {
      console.log('✅ Server is accessible');
      console.log('   Issue might be in API logic or client-side');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  setTimeout(() => process.exit(0), 1000);
}

testServerConnection();

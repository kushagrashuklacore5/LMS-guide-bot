// Test Security Headers Implementation
const axios = require('axios');

const API_URL = 'http://127.0.0.1:5002';

async function testSecurityHeaders() {
  console.log('🛡️ Testing Security Headers Implementation');
  console.log('======================================');
  
  try {
    // Test 1: Check security headers on a basic endpoint
    console.log('🔍 Test 1: Checking security headers on /api/test-rate-limit...');
    
    try {
      const response = await axios.get(`${API_URL}/api/test-rate-limit`, {
        timeout: 5000
      });
      
      console.log('✅ Response received successfully');
      console.log('📊 Status Code:', response.status);
      console.log('📋 Response Headers:');
      
      // Important security headers to check
      const securityHeaders = [
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
        'strict-transport-security',
        'permissions-policy',
        'x-xss-protection',
        'cross-origin-resource-policy',
        'cross-origin-embedder-policy',
        'expect-ct',
        'x-dns-prefetch-control'
      ];
      
      securityHeaders.forEach(header => {
        const value = response.headers[header];
        if (value) {
          console.log(`   ✅ ${header}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
        } else {
          console.log(`   ❌ ${header}: NOT PRESENT`);
        }
      });
      
    } catch (error) {
      console.log('❌ Error testing /api/test-rate-limit:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.log('   💡 Make sure the server is running on port 5002');
      }
    }
    
    console.log('');
    
    // Test 2: Check security headers on login endpoint
    console.log('🔍 Test 2: Checking security headers on /api/auth/login...');
    
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword'
      }, {
        timeout: 5000
      });
      
      console.log('✅ Login endpoint responded');
      console.log('📋 Login Response Headers:');
      
      securityHeaders.forEach(header => {
        const value = loginResponse.headers[header];
        if (value) {
          console.log(`   ✅ ${header}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
        } else {
          console.log(`   ❌ ${header}: NOT PRESENT`);
        }
      });
      
    } catch (error) {
      console.log('✅ Login endpoint returned error (expected for wrong credentials)');
      console.log('📋 Error Response Headers:');
      
      if (error.response) {
        securityHeaders.forEach(header => {
          const value = error.response.headers[header];
          if (value) {
            console.log(`   ✅ ${header}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
          } else {
            console.log(`   ❌ ${header}: NOT PRESENT`);
          }
        });
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
    console.log('');
    
    // Test 3: Check CORS is still working
    console.log('🔍 Test 3: Verifying CORS is still working...');
    
    try {
      const corsResponse = await axios.options(`${API_URL}/api/auth/login`, {
        timeout: 5000,
        headers: {
          'Origin': 'http://localhost:5174',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log('✅ CORS preflight successful');
      console.log('📋 CORS Headers:');
      
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials',
        'access-control-max-age'
      ];
      
      corsHeaders.forEach(header => {
        const value = corsResponse.headers[header];
        if (value) {
          console.log(`   ✅ ${header}: ${value}`);
        } else {
          console.log(`   ❌ ${header}: NOT PRESENT`);
        }
      });
      
    } catch (error) {
      console.log('❌ CORS preflight failed:', error.message);
    }
    
    console.log('');
    
    // Test 4: Check API functionality is preserved
    console.log('🔍 Test 4: Verifying API functionality is preserved...');
    
    try {
      const apiResponse = await axios.get(`${API_URL}/api/auth/me`, {
        timeout: 5000
      });
      
      console.log('✅ API endpoint responded (may be unauthorized as expected)');
      console.log('📊 Status:', apiResponse.status);
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ API endpoint working (401 unauthorized is expected)');
      } else {
        console.log('❌ API endpoint error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('');
  console.log('📊 Security Headers Test Summary:');
  console.log('================================');
  console.log('✅ Security middleware should add the following headers:');
  console.log('   - Content-Security-Policy: Prevents XSS and code injection');
  console.log('   - X-Frame-Options: Prevents clickjacking');
  console.log('   - X-Content-Type-Options: Prevents MIME sniffing');
  console.log('   - Referrer-Policy: Controls referrer information');
  console.log('   - Permissions-Policy: Restricts browser features');
  console.log('   - X-XSS-Protection: Additional XSS protection');
  console.log('');
  console.log('🚀 If all headers are present, security is enhanced!');
  console.log('🔧 If some headers are missing, check CSP configuration');
}

// Run the test
testSecurityHeaders().catch(console.error);

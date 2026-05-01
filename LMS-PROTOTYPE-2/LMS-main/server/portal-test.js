const axios = require('axios');

// Load environment variables
require('dotenv').config();

// Generate JWT token for portal user
function generatePortalToken() {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  console.log('Using JWT secret:', secret.substring(0, 10) + '...');
  
  return jwt.sign(
    { 
      userId: 69, 
      email: 'portal@core5.co.in', 
      role: 'portal_admin',
      name: 'Portal Admin'
    },
    secret,
    { expiresIn: '24h' }
  );
}

async function testPortalAPI() {
  try {
    const token = generatePortalToken();
    console.log('Generated portal token');
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('Token being sent:', token.substring(0, 50) + '...');
    console.log('Authorization header:', `Bearer ${token.substring(0, 50)}...`);
    
    console.log('\n=== Testing Internal Portal API ===');
    
    // Test 1: Debug endpoint (no auth required)
    console.log('\n1. Testing debug endpoint...');
    try {
      const debugResponse = await axios.get('http://127.0.0.1:5002/api/superadmin/internal/debug');
      console.log('Debug response:', debugResponse.data);
    } catch (error) {
      console.error('Debug failed:', error.response?.data || error.message);
    }
    
    // Test 2: Health check (no auth required)
    console.log('\n2. Testing health check...');
    try {
      const testResponse = await axios.get('http://127.0.0.1:5002/api/superadmin/internal/test');
      console.log('Health check response:', testResponse.data);
    } catch (error) {
      console.error('Health check failed:', error.response?.data || error.message);
    }
    
    // Test 3: Get superadmins without auth
    console.log('\n3. Testing get superadmins without auth...');
    try {
      const superadminsTestResponse = await axios.get('http://127.0.0.1:5002/api/superadmin/internal/superadmins-test');
      console.log('Superadmins test response:', superadminsTestResponse.data);
      console.log('Found superadmins:', superadminsTestResponse.data.data?.length || 0);
    } catch (error) {
      console.error('Get superadmins test failed:', error.response?.data || error.message);
    }
    
    // Test 4: Get superadmins with auth
    console.log('\n4. Testing get superadmins with auth...');
    try {
      const superadminsResponse = await axios.get('http://127.0.0.1:5002/api/superadmin/internal/superadmins', config);
      console.log('Superadmins response:', superadminsResponse.data);
      console.log('Found superadmins:', superadminsResponse.data.data?.length || 0);
    } catch (error) {
      console.error('Get superadmins failed:', error.response?.data || error.message);
    }
    
    // Test 3: Create superadmin
    console.log('\n3. Testing create superadmin...');
    try {
      const createResponse = await axios.post('http://127.0.0.1:5002/api/superadmin/internal/create-superadmin', {
        email: 'test-portal@superadmin.com'
      }, config);
      console.log('Create superadmin response:', createResponse.data);
    } catch (error) {
      console.error('Create superadmin failed:', error.response?.data || error.message);
    }
    
    console.log('\n=== API Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  process.exit(0);
}

testPortalAPI();

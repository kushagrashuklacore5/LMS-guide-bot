const jwt = require("jsonwebtoken");
const axios = require("axios");

async function debugJWTToken() {
  console.log('🔍 Debugging JWT token...\n');
  
  try {
    // Get token from login
    const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful');
    console.log('🔑 Token:', token.substring(0, 50) + '...');
    console.log('🔑 Token length:', token.length);
    
    // Decode the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_key');
      console.log('✅ JWT decoded successfully');
      console.log('👤 Decoded token:', decoded);
      
      // Check if all required fields are present
      const requiredFields = ['userId', 'role', 'email', 'name'];
      const missingFields = requiredFields.filter(field => !(decoded[field]));
      
      if (missingFields.length > 0) {
        console.log('❌ Missing fields in token:', missingFields);
      } else {
        console.log('✅ All required fields present');
      }
      
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError.message);
      console.log('🔑 JWT Secret:', process.env.JWT_SECRET || 'default_jwt_secret_key');
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugJWTToken();

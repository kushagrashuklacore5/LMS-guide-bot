const axios = require('axios');

async function testUniversityCreationLogin() {
  console.log('🧪 Testing university creation and admin login...\n');
  
  try {
    // Test 1: Create university with admin
    console.log('🏫 Creating university with admin...');
    
    const createUniRes = await axios.post('http://127.0.0.1:5002/api/superadmin/create-university', {
      universityName: 'Login Test University',
      area: 'Test Area',
      adminName: 'Login Test Admin',
      adminEmail: 'logintest@example.com'
    });
    
    console.log('✅ University created:', createUniRes.data.university);
    console.log('🔑 Generated admin password:', createUniRes.data.generatedPassword);
    
    // Test 2: Try to login with generated admin password
    console.log('\n🔐 Testing admin login with generated password...');
    
    try {
      const adminLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'logintest@example.com',
        password: createUniRes.data.generatedPassword
      });
      
      console.log('✅ Admin login successful!');
      console.log('👤 Admin logged in:', adminLoginRes.data.user);
      console.log('✅ Generated password is working correctly');
      
    } catch (adminLoginError) {
      console.log('❌ Admin login failed:', adminLoginError.response?.data?.message || adminLoginError.message);
      
      // Try with a different password to see if the issue is with the generated password
      console.log('\n🔍 Testing with a simple password...');
      
      try {
        const simpleLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
          email: 'logintest@example.com',
          password: '12345678'
        });
        
        console.log('✅ Simple password login successful!');
        console.log('❌ Issue is with the generated password format');
        
      } catch (simpleLoginError) {
        console.log('❌ Simple password login also failed:', simpleLoginError.response?.data?.message || simpleLoginError.message);
        console.log('❌ Issue might be with user creation or authentication');
      }
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    
    const db = require('./config/database-switch');
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE email = ?', ['logintest@example.com'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM universities WHERE name = ?', ['Login Test University'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Cleanup completed');
    console.log('\n🎉 University creation login test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testUniversityCreationLogin();
